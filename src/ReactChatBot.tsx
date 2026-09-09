'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChatLabels, ReactChatBotProps } from './types';
import { useChatBot } from './useChatBot';
let activeSpeechOwner: object | null = null;

const defaults: ChatLabels = {
  title: 'Chat',
  input: 'Message',
  placeholder: 'Write a message…',
  send: 'Send',
  stop: 'Stop',
  clear: 'Clear conversation',
  retry: 'Try again',
  typing: 'Writing a reply…',
  error: 'Could not complete the reply. Please try again.',
  user: 'You',
  assistant: 'Assistant',
  readAloud: 'Read reply aloud',
};
export function ReactChatBot(props: ReactChatBotProps) {
  const { messages, isLoading, error, sendMessage, stop, clear, retry } =
    useChatBot(props);
  const [input, setInput] = useState('');
  const [canSpeak, setCanSpeak] = useState(false);
  const labels = { ...defaults, ...props.labels };
  const id = useId();
  const log = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const speechOwner = useRef({});
  useEffect(() => {
    setCanSpeak(
      typeof window.speechSynthesis !== 'undefined' &&
        typeof window.SpeechSynthesisUtterance !== 'undefined',
    );
    return () => {
      if (activeSpeechOwner === speechOwner.current)
        window.speechSynthesis?.cancel();
    };
  }, []);
  useEffect(() => {
    if (nearBottom.current && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  const submit = () => {
    const maxLength = Number.isFinite(props.maxLength)
      ? Math.max(1, Math.floor(props.maxLength!))
      : 2000;
    if (
      props.disabled ||
      isLoading ||
      !input.trim() ||
      input.trim().length > maxLength
    )
      return;
    const value = input;
    setInput('');
    nearBottom.current = true;
    void sendMessage(value);
  };
  return (
    <section
      className={`rcb ${props.className ?? ''}`}
      style={props.style}
      aria-labelledby={`${id}-title`}
    >
      <header className="rcb-header">
        <h2 id={`${id}-title`}>{props.title ?? labels.title}</h2>
        <button
          type="button"
          className="rcb-secondary"
          disabled={props.disabled}
          onClick={() => {
            clear();
            setInput('');
            nearBottom.current = true;
            if (activeSpeechOwner === speechOwner.current)
              window.speechSynthesis?.cancel();
          }}
        >
          {labels.clear}
        </button>
      </header>
      <div
        ref={log}
        className="rcb-log"
        role="log"
        aria-label={props.title ?? labels.title}
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isLoading}
        tabIndex={0}
        onScroll={() => {
          const el = log.current;
          if (el)
            nearBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 64;
        }}
      >
        {messages.map((item) => (
          <div
            key={item.id}
            className={`rcb-message rcb-message-${item.role}`}
            data-status={item.status}
          >
            {(item.role === 'user' ? props.userIcon : props.botIcon) && (
              <img
                className="rcb-avatar"
                alt=""
                src={item.role === 'user' ? props.userIcon : props.botIcon}
              />
            )}
            <div className="rcb-bubble">
              <span className="rcb-author">
                {item.role === 'user' ? labels.user : labels.assistant}
              </span>
              <div className="rcb-content">
                {props.renderMessage
                  ? props.renderMessage(item)
                  : item.content ||
                    (item.status === 'streaming'
                      ? labels.typing
                      : item.status === 'error'
                        ? labels.error
                        : '…')}
              </div>
              {props.speech &&
                canSpeak &&
                item.role === 'assistant' &&
                item.status === 'complete' && (
                  <button
                    type="button"
                    className="rcb-speech"
                    aria-label={labels.readAloud}
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(
                        item.content,
                      );
                      if (props.speechLang) utterance.lang = props.speechLang;
                      activeSpeechOwner = speechOwner.current;
                      const release = () => {
                        if (activeSpeechOwner === speechOwner.current)
                          activeSpeechOwner = null;
                      };
                      utterance.onend = release;
                      utterance.onerror = release;
                      window.speechSynthesis.speak(utterance);
                    }}
                  >
                    ▷ {labels.readAloud}
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="rcb-error" role="alert">
          {labels.error}{' '}
          <button
            type="button"
            disabled={props.disabled || isLoading}
            onClick={() => void retry()}
          >
            {labels.retry}
          </button>
        </div>
      )}
      {!!props.suggestions?.length && (
        <div className="rcb-suggestions">
          {props.suggestions.map((text, index) => (
            <button
              type="button"
              key={`${index}-${text}`}
              disabled={props.disabled || isLoading}
              onClick={() => {
                nearBottom.current = true;
                void sendMessage(text);
              }}
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <form
        className="rcb-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="rcb-sr-only" htmlFor={`${id}-input`}>
          {labels.input}
        </label>
        <textarea
          id={`${id}-input`}
          value={input}
          rows={2}
          placeholder={labels.placeholder}
          maxLength={props.maxLength ?? 2000}
          disabled={props.disabled}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {isLoading ? (
          <button type="button" onClick={stop}>
            {labels.stop}
          </button>
        ) : (
          <button type="submit" disabled={props.disabled || !input.trim()}>
            {labels.send}
          </button>
        )}
      </form>
    </section>
  );
}
