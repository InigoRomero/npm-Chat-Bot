'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatOptions } from './types';
import { getLocalReply } from './replies';
let sequence = 0;
function message(
  role: ChatMessage['role'],
  content: string,
  status: ChatMessage['status'] = 'complete',
): ChatMessage {
  return {
    id: `chat-${Date.now()}-${++sequence}`,
    role,
    content,
    status,
    createdAt: Date.now(),
  };
}
function limit(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : fallback;
}
function seed(options: ChatOptions): ChatMessage[] {
  if (options.initialMessages)
    return options.initialMessages.map((item) => ({ ...item }));
  return options.welcomeMessage === false
    ? []
    : [
        message(
          'assistant',
          options.welcomeMessage ?? 'Hello! How can I help you today?',
        ),
      ];
}
function validHistory(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        typeof item.createdAt === 'number' &&
        Number.isFinite(item.createdAt) &&
        ['complete', 'streaming', 'error', 'cancelled'].includes(item.status),
    ) &&
    new Set(value.map((item) => item.id)).size === value.length
  );
}
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}
function abortable<T>(
  value: T | PromiseLike<T>,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(value).then(
      (result) => {
        signal.removeEventListener('abort', abort);
        resolve(result);
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
    if (signal.aborted) abort();
  });
}
export function useChatBot(options: ChatOptions = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    seed(options).slice(-limit(options.maxMessages, 100)),
  );
  const messagesRef = useRef(messages);
  const request = useRef<AbortController | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryInput = useRef<{ input: string; history: ChatMessage[] } | null>(
    null,
  );
  const update = useCallback((next: ChatMessage[]) => {
    const bounded = next.slice(-limit(optionsRef.current.maxMessages, 100));
    messagesRef.current = bounded;
    setMessages(bounded);
  }, []);
  // Hydrate only after mount so SSR and the first client render agree.
  useEffect(() => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError(null);
    retryInput.current = null;
    let next = seed(optionsRef.current);
    const key = optionsRef.current.storageKey;
    if (key) {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (validHistory(stored))
          next = stored.map((item) =>
            item.status === 'streaming'
              ? { ...item, status: 'cancelled' }
              : item,
          );
      } catch {
        /* Storage may be blocked or contain an older format. */
      }
    }
    update(next);
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [options.storageKey, update]);
  useEffect(() => {
    // Avoid persisting the pre-hydration render under a newly selected key.
    if (messages !== messagesRef.current) return;
    if (options.storageKey) {
      try {
        localStorage.setItem(options.storageKey, JSON.stringify(messages));
      } catch {
        /* Persistence is best effort. */
      }
    }
    optionsRef.current.onMessagesChange?.(messages);
  }, [messages, options.storageKey]);
  const stop = useCallback(() => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    update(
      messagesRef.current.map((item) =>
        item.status === 'streaming' ? { ...item, status: 'cancelled' } : item,
      ),
    );
  }, [update]);
  const clear = useCallback(() => {
    stop();
    setError(null);
    retryInput.current = null;
    update(seed(optionsRef.current));
  }, [stop, update]);
  const run = useCallback(
    async (input: string, retry = false): Promise<boolean> => {
      const settings = optionsRef.current;
      const text = input.trim();
      if (
        !text ||
        text.length > limit(settings.maxLength, 2000) ||
        request.current
      )
        return false;
      const controller = new AbortController();
      request.current = controller;
      setLoading(true);
      setError(null);
      const history =
        retry && retryInput.current
          ? retryInput.current.history
          : [...messagesRef.current, message('user', text)];
      retryInput.current = null;
      const pending = message('assistant', '', 'streaming');
      update([...history, pending]);
      const active = () =>
        request.current === controller && !controller.signal.aborted;
      const patch = (content: string, status: ChatMessage['status']) => {
        if (active())
          update(
            messagesRef.current.map((item) =>
              item.id === pending.id ? { ...item, content, status } : item,
            ),
          );
      };
      let content = '';
      try {
        const delay = settings.responseDelay ?? 0;
        if (Number.isFinite(delay) && delay > 0)
          await wait(delay, controller.signal);
        if (!active()) return true;
        const result = settings.getResponse
          ? await abortable(
              settings.getResponse(text, {
                messages: history
                  .slice(-limit(settings.maxMessages, 100))
                  .map((item) => ({ ...item })),
                signal: controller.signal,
              }),
              controller.signal,
            )
          : getLocalReply(text, {
              prompts: settings.PromptsBot,
              replies: settings.RepliesBot,
              fallback: settings.notFoundBot,
            });
        if (!active()) return true;
        if (typeof result === 'string') content = result;
        else if (result && typeof result[Symbol.asyncIterator] === 'function') {
          const iterator = result[Symbol.asyncIterator]();
          let finished = false;
          try {
            while (active()) {
              const chunk = await abortable(iterator.next(), controller.signal);
              if (!active()) break;
              if (chunk.done) {
                finished = true;
                break;
              }
              if (typeof chunk.value !== 'string')
                throw new TypeError('Response chunks must be strings.');
              content += chunk.value;
              patch(content, 'streaming');
            }
          } finally {
            // Do not let a provider that ignores abort keep the UI promise pending.
            if (!finished && iterator.return) {
              try {
                void Promise.resolve(iterator.return()).catch(() => {});
              } catch {
                /* Best-effort cleanup. */
              }
            }
          }
        } else
          throw new TypeError(
            'getResponse must return a string or an async iterable of strings.',
          );
        if (!active()) return true;
        if (!content.trim()) throw new Error('The response was empty.');
        patch(content, 'complete');
      } catch (cause) {
        if (active()) {
          const failure =
            cause instanceof Error ? cause : new Error(String(cause));
          patch(content, 'error');
          setError(failure);
          retryInput.current = {
            input: text,
            history: history.slice(-limit(settings.maxMessages, 100)),
          };
          settings.onError?.(failure);
        }
      } finally {
        if (active()) {
          request.current = null;
          setLoading(false);
        }
      }
      return true;
    },
    [update],
  );
  const sendMessage = useCallback((input: string) => run(input), [run]);
  const retry = useCallback(
    () =>
      retryInput.current
        ? run(retryInput.current.input, true)
        : Promise.resolve(false),
    [run],
  );
  return { messages, isLoading, error, sendMessage, stop, clear, retry };
}
