import { StrictMode } from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactChatBot, { useChatBot } from '../src';
import type { ChatMessage, ResponseContext } from '../src';
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
it('shows one welcome in StrictMode, submits originals safely and honors legacy props', async () => {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <ReactChatBot
        welcomeMessage="Welcome"
        PromptsBot={[['Hola 42']]}
        RepliesBot={[['¡Hola!']]}
      />
    </StrictMode>,
  );
  expect(screen.getAllByText('Welcome')).toHaveLength(1);
  await user.type(screen.getByRole('textbox'), 'HOLA 42!{Enter}');
  expect(await screen.findByText('¡Hola!')).toBeInTheDocument();
  expect(screen.getByText('HOLA 42!')).toBeInTheDocument();
  await user.type(
    screen.getByRole('textbox'),
    '<img src=x onerror=alert(1)>{Enter}',
  );
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  expect(screen.queryByRole('img')).toBeNull();
});
it('isolates multiple instances and labels', async () => {
  const user = userEvent.setup();
  render(
    <>
      <ReactChatBot
        title="First"
        welcomeMessage={false}
        getResponse={() => 'One'}
      />
      <ReactChatBot title="Second" welcomeMessage={false} />
    </>,
  );
  const [first, second] = screen.getAllByRole('textbox');
  expect(first.id).not.toBe(second.id);
  await user.type(first, 'Hello{Enter}');
  expect(
    within(screen.getByRole('log', { name: 'First' })).getByText('One'),
  ).toBeInTheDocument();
  expect(screen.getByRole('log', { name: 'Second' })).toBeEmptyDOMElement();
});
it('supports multiline input and does not send during IME composition', async () => {
  const provider = vi.fn(() => 'Reply');
  render(<ReactChatBot getResponse={provider} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'こんにちは' } });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
  expect(provider).not.toHaveBeenCalled();
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Enter' });
  });
  expect(provider).toHaveBeenCalledTimes(1);
});
it('rejects blank, oversized and overlapping requests', async () => {
  const pending = deferred<string>();
  const { result } = renderHook(() =>
    useChatBot({ maxLength: 5, getResponse: () => pending.promise }),
  );
  await act(async () => {
    expect(await result.current.sendMessage(' ')).toBe(false);
    expect(await result.current.sendMessage('123456')).toBe(false);
  });
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Hi');
  });
  await act(async () => {
    expect(await result.current.sendMessage('Again')).toBe(false);
  });
  await act(async () => {
    pending.resolve('Done');
    await sending;
  });
  expect(result.current.isLoading).toBe(false);
});
it('streams deltas and passes the conversation and abort signal to providers', async () => {
  const gate = deferred<void>();
  let context!: ResponseContext;
  const { result } = renderHook(() =>
    useChatBot({
      welcomeMessage: false,
      getResponse: async function* (_, ctx) {
        context = ctx;
        yield 'Hello';
        await gate.promise;
        yield ' world';
      },
    }),
  );
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Hi');
  });
  await waitFor(() =>
    expect(result.current.messages.at(-1)?.content).toBe('Hello'),
  );
  expect(result.current.isLoading).toBe(true);
  expect(context.messages.map((item) => item.content)).toEqual(['Hi']);
  expect(context.signal.aborted).toBe(false);
  await act(async () => {
    gate.resolve();
    await sending;
  });
  expect(result.current.messages.at(-1)).toMatchObject({
    content: 'Hello world',
    status: 'complete',
  });
});
it('cancels stale replies after clearing and allows a new request', async () => {
  const pending = deferred<string>();
  let signal!: AbortSignal;
  const provider = vi
    .fn((_: string, ctx: ResponseContext) => {
      signal = ctx.signal;
      return pending.promise;
    })
    .mockImplementationOnce((_, ctx) => {
      signal = ctx.signal;
      return pending.promise;
    });
  const { result, rerender } = renderHook(
    ({ getResponse }) => useChatBot({ welcomeMessage: false, getResponse }),
    {
      initialProps: {
        getResponse: provider as (
          input: string,
          context: ResponseContext,
        ) => string | Promise<string>,
      },
    },
  );
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Old');
  });
  act(() => result.current.clear());
  expect(signal.aborted).toBe(true);
  rerender({ getResponse: () => 'New reply' });
  await act(async () => {
    await result.current.sendMessage('New');
    pending.resolve('Stale');
    await sending;
  });
  expect(result.current.messages.map((item) => item.content)).toEqual([
    'New',
    'New reply',
  ]);
});
it('retains partial output when stopped and ignores late stream chunks', async () => {
  const gate = deferred<void>();
  const { result } = renderHook(() =>
    useChatBot({
      getResponse: async function* () {
        yield 'Partial';
        await gate.promise;
        yield ' late';
      },
    }),
  );
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Hi');
  });
  await waitFor(() =>
    expect(result.current.messages.at(-1)?.content).toBe('Partial'),
  );
  act(() => result.current.stop());
  expect(result.current.messages.at(-1)?.status).toBe('cancelled');
  await act(async () => {
    gate.resolve();
    await sending;
  });
  expect(result.current.messages.at(-1)?.content).toBe('Partial');
});
it('reports errors and retries without duplicating the user message', async () => {
  const error = new Error('Offline');
  const onError = vi.fn();
  const provider = vi
    .fn()
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce('Recovered');
  const { result } = renderHook(() =>
    useChatBot({ welcomeMessage: false, getResponse: provider, onError }),
  );
  await act(async () => {
    await result.current.sendMessage('Hi');
  });
  expect(onError).toHaveBeenCalledWith(error);
  expect(result.current.error).toBe(error);
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.messages.map((item) => item.content)).toEqual([
    'Hi',
    'Recovered',
  ]);
  expect(result.current.error).toBeNull();
});
it('handles empty provider replies as retryable errors', async () => {
  const { result } = renderHook(() => useChatBot({ getResponse: () => '' }));
  await act(async () => {
    await result.current.sendMessage('Hi');
  });
  expect(result.current.error?.message).toBe('The response was empty.');
  expect(result.current.isLoading).toBe(false);
});
it('restores, caps and resets opt-in history without leaking between keys', async () => {
  const saved: ChatMessage[] = [
    {
      id: 'saved',
      role: 'assistant',
      content: 'Saved',
      createdAt: 1,
      status: 'streaming',
    },
  ];
  localStorage.setItem('a', JSON.stringify(saved));
  const { result, rerender } = renderHook(
    ({ storageKey }) =>
      useChatBot({ storageKey, welcomeMessage: 'Welcome', maxMessages: 2 }),
    { initialProps: { storageKey: 'a' } },
  );
  expect(result.current.messages[0]).toMatchObject({
    content: 'Saved',
    status: 'cancelled',
  });
  await act(async () => {
    await result.current.sendMessage('Hi');
  });
  expect(result.current.messages).toHaveLength(2);
  expect(JSON.parse(localStorage.getItem('a')!)).toHaveLength(2);
  rerender({ storageKey: 'b' });
  expect(result.current.messages.map((item) => item.content)).toEqual([
    'Welcome',
  ]);
  expect(JSON.parse(localStorage.getItem('a')!)[0].content).toBe('Hi');
  act(() => result.current.clear());
  expect(JSON.parse(localStorage.getItem('b')!)[0].content).toBe('Welcome');
});
it('tolerates corrupt or unavailable storage', () => {
  localStorage.setItem('broken', '{');
  const first = renderHook(() => useChatBot({ storageKey: 'broken' }));
  expect(first.result.current.messages).toHaveLength(1);
  first.unmount();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Blocked');
  });
  expect(() =>
    renderHook(() => useChatBot({ storageKey: 'blocked' })),
  ).not.toThrow();
});
it('aborts pending work on unmount', async () => {
  const pending = deferred<string>();
  let signal!: AbortSignal;
  const { result, unmount } = renderHook(() =>
    useChatBot({
      getResponse: (_, context) => {
        signal = context.signal;
        return pending.promise;
      },
    }),
  );
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Hi');
  });
  unmount();
  expect(signal.aborted).toBe(true);
  pending.resolve('Late');
  await sending;
});
it('supports translated controls, suggestions, disabled state and explicit speech', async () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string;
      lang = '';
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  const user = userEvent.setup();
  const { rerender, unmount } = render(
    <ReactChatBot
      speech
      speechLang="es-ES"
      welcomeMessage="Hola"
      labels={{ send: 'Enviar', input: 'Mensaje' }}
      suggestions={['hello']}
    />,
  );
  expect(speak).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Read reply aloud' }));
  expect(speak).toHaveBeenCalledWith(
    expect.objectContaining({ text: 'Hola', lang: 'es-ES' }),
  );
  await user.click(screen.getByRole('button', { name: 'hello' }));
  expect(
    within(screen.getByRole('log')).getByText('hello'),
  ).toBeInTheDocument();
  rerender(
    <ReactChatBot disabled labels={{ send: 'Enviar', input: 'Mensaje' }} />,
  );
  expect(screen.getByRole('textbox', { name: 'Mensaje' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  unmount();
  expect(cancel).toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it('settles sends promptly on stop even when the provider ignores the signal', async () => {
  const { result } = renderHook(() =>
    useChatBot({ getResponse: () => new Promise<string>(() => {}) }),
  );
  let sending!: Promise<boolean>;
  act(() => {
    sending = result.current.sendMessage('Hi');
  });
  await act(async () => {
    result.current.stop();
    expect(await sending).toBe(true);
  });
  expect(result.current.isLoading).toBe(false);
});
it('cancels a response delay before invoking the provider', async () => {
  vi.useFakeTimers();
  try {
    const provider = vi.fn(() => 'Late');
    const { result } = renderHook(() =>
      useChatBot({ getResponse: provider, responseDelay: 2000 }),
    );
    let sending!: Promise<boolean>;
    act(() => {
      sending = result.current.sendMessage('Hi');
    });
    await act(async () => {
      result.current.stop();
      await sending;
      await vi.runAllTimersAsync();
    });
    expect(provider).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});
it('does not write storage unless opted in and notifies history changes', async () => {
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  const onMessagesChange = vi.fn();
  const { result } = renderHook(() => useChatBot({ onMessagesChange }));
  await act(async () => {
    await result.current.sendMessage('Hello');
  });
  expect(storage).not.toHaveBeenCalled();
  expect(onMessagesChange).toHaveBeenLastCalledWith(result.current.messages);
});
it('preserves the failed request context when retrying a one-message history', async () => {
  const provider = vi
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce('Recovered');
  const { result } = renderHook(() =>
    useChatBot({
      welcomeMessage: false,
      maxMessages: 1,
      getResponse: provider,
    }),
  );
  await act(async () => {
    await result.current.sendMessage('My question');
  });
  await act(async () => {
    await result.current.retry();
  });
  expect(provider.mock.calls[1][1].messages).toEqual([
    expect.objectContaining({ role: 'user', content: 'My question' }),
  ]);
  expect(result.current.messages).toHaveLength(1);
  expect(result.current.messages[0].content).toBe('Recovered');
});
it('does not discard a draft when maxLength is reduced below its length', async () => {
  const user = userEvent.setup();
  const provider = vi.fn(() => 'Reply');
  const { rerender } = render(
    <ReactChatBot maxLength={20} getResponse={provider} />,
  );
  await user.type(screen.getByRole('textbox'), 'Long draft');
  rerender(<ReactChatBot maxLength={3} getResponse={provider} />);
  await user.click(screen.getByRole('button', { name: 'Send' }));
  expect(provider).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveValue('Long draft');
});
