# react-chat-bot42

**[Try the live demo](https://inigoromero.github.io/npm-Chat-Bot/)** · [npm package](https://www.npmjs.com/package/react-chat-bot42)

A small, accessible chatbot component and headless hook for **React 18 and 19**, written in TypeScript. Use predefined replies or connect your own backend with an async response provider. No runtime dependencies beyond React.

> **1.0.0 is available on npm.** This is a breaking upgrade from 0.7.x. See [migration notes](#migrating-from-07x).

## Quick start

```sh
npm install react-chat-bot42
```

[Open the live demo](https://inigoromero.github.io/npm-Chat-Bot/) to try local replies, simulated streaming, stop/retry controls and themes without installing anything.

To test unpublished repository changes, run `npm ci && npm pack` and install the generated `.tgz` in your application.

```tsx
import ReactChatBot from 'react-chat-bot42';
import 'react-chat-bot42/styles.css';

export default function App() {
  return (
    <ReactChatBot
      title="Support"
      welcomeMessage="Hello! How can I help?"
      PromptsBot={[
        ['hello', 'hi'],
        ['delivery', 'shipping'],
      ]}
      RepliesBot={[['Hi there!'], ['Orders arrive in 2–3 working days.']]}
      notFoundBot={['Please contact support@example.com for help.']}
      suggestions={['Hello', 'Shipping']}
    />
  );
}
```

Import the stylesheet once in your application. It is separate from JavaScript so Node/SSR imports work without CSS loaders. Styles are scoped under `.rcb`; Bootstrap is not required. For Next.js App Router, put callbacks/hooks inside a Client Component and import the CSS in your layout or stylesheet entry.

## Features

- Welcome messages, local prompt groups, fallback replies and suggested questions.
- Async providers, streamed text deltas, typing state, stop, retry and reset.
- Optional bounded conversation persistence in localStorage.
- Accessible labels, polite chat log, keyboard navigation, Enter to send, Shift+Enter for a new line, IME support.
- Explicit, opt-in read-aloud buttons using browser speech synthesis.
- Custom avatars, translated labels, CSS variables and custom message rendering.
- Independent chat instances, a headless hook, SSR-safe imports and React StrictMode support.
- ESM, CommonJS and TypeScript declarations; React remains a peer dependency.

This is a chat UI and local reply engine, not a hosted AI service. AI responses require your own backend.

## Connect a backend

```tsx
import type { ResponseProvider } from 'react-chat-bot42';

const getResponse: ResponseProvider = async (input, { messages, signal }) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, messages }),
    signal,
  });
  if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
  const data = await response.json();
  if (typeof data.reply !== 'string') throw new Error('Invalid reply');
  return data.reply;
};

// <ReactChatBot getResponse={getResponse} />
```

Keep provider credentials on your server. `messages` is a bounded snapshot including the current user message and excluding the in-progress assistant placeholder. Forward the AbortSignal to your network client. The UI ignores late results after stop, reset, key changes or unmount. Only one response runs per instance; further sends return `false` while busy. Empty responses and thrown errors expose a retry action; a retry replaces the failed assistant message without duplicating the user's input.

### Streaming

An async iterable yields **deltas**, not the full accumulated response. For a backend returning a raw UTF-8 text stream:

```tsx
const getResponse: ResponseProvider = async function* (input, { signal }) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
    signal,
  });
  if (!response.ok || !response.body) throw new Error('Stream unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
};
```

For SSE or another framed protocol, parse its events in your provider before yielding text. Stop retains the partial answer with status `cancelled`. The provider should honor `signal` to release its own resources promptly.

## Component and hook options

| Option                     | Default                            | Behavior                                                                         |
| -------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| `PromptsBot`, `RepliesBot` | Built-in groups                    | Arrays of phrase groups and corresponding response groups. Supply both together. |
| `notFoundBot`              | Built-in fallback                  | Random reply for unmatched input or missing/empty reply groups.                  |
| `welcomeMessage`           | `Hello! How can I help you today?` | String, or `false` to disable.                                                   |
| `initialMessages`          | Welcome only                       | Initial `ChatMessage[]`; also used on clear.                                     |
| `getResponse`              | Local reply engine                 | Sync/async string or async iterable; takes precedence over local rules.          |
| `responseDelay`            | `0`                                | Optional delay in milliseconds before invoking the provider.                     |
| `storageKey`               | Off                                | Opt in to localStorage persistence. Use a distinct key per conversation/user.    |
| `maxMessages`              | `100`                              | Maximum retained messages (oldest removed); bounds provider context and storage. |
| `maxLength`                | `2000`                             | Maximum user message length; blank or oversized sends are rejected.              |
| `onMessagesChange`         | —                                  | Receives read-only history after updates, including streamed deltas.             |
| `onError`                  | —                                  | Receives provider errors; the UI displays a generic translatable message.        |

Local matching normalizes both prompts and input with Unicode NFKC, lowercase, punctuation and whitespace. It preserves accented letters, non-Latin scripts and digits. It uses exact normalized matches, not fuzzy or semantic matching. Original user text remains visible. The first matching group wins; a reply is selected once from that group.

`initialMessages` and `welcomeMessage` seed the conversation on mount, key changes and clear; changing them alone does not reset an active chat. Configuration for replies/providers is read for each new request. `maxMessages` is applied on the next history update. Persistence loads after mount to avoid hydration differences. Corrupt or blocked storage falls back gracefully. Persisted streaming messages restore as cancelled. Clear resets the selected conversation to its initial messages and updates storage. There is no cross-tab synchronization, automatic expiry or encryption; omit `storageKey` for ephemeral conversations, and clear/remove user-specific keys on sign-out. Retry state is in memory and does not survive reload.

### UI-only options

| Option                | Default         | Behavior                                                                        |
| --------------------- | --------------- | ------------------------------------------------------------------------------- |
| `title`               | `Chat`          | Header and accessible chat name.                                                |
| `botIcon`, `userIcon` | None            | Optional avatar URLs.                                                           |
| `suggestions`         | None            | Quick-send buttons.                                                             |
| `disabled`            | `false`         | Disables new user input, reset and retry; an active reply can still be stopped. |
| `labels`              | English         | Partial `ChatLabels` override.                                                  |
| `speech`              | `false`         | Show read-aloud controls where supported; never autoplay.                       |
| `speechLang`          | Browser default | Language tag such as `es-ES`.                                                   |
| `className`, `style`  | —               | Root styling.                                                                   |
| `renderMessage`       | Plain text      | `(message) => ReactNode` for custom content.                                    |

Speech synthesis uses the browser's shared speech queue; pressing a read-aloud button replaces the current speech. Voice availability depends on the browser/OS. Text renders safely through React; custom renderers are responsible for sanitizing any raw HTML they choose to use.

```tsx
<ReactChatBot
  title="Ayuda"
  welcomeMessage="¡Hola! ¿En qué puedo ayudarte?"
  speech
  speechLang="es-ES"
  labels={{
    input: 'Mensaje',
    placeholder: 'Escribe un mensaje…',
    send: 'Enviar',
    stop: 'Detener',
    clear: 'Borrar conversación',
    retry: 'Reintentar',
    typing: 'Escribiendo…',
    user: 'Tú',
    assistant: 'Asistente',
    error: 'No se pudo completar la respuesta.',
    readAloud: 'Leer respuesta',
  }}
/>
```

```css
.my-chat {
  --rcb-accent: #285ddb;
  --rcb-background: #172437;
  --rcb-text: #eef2fa;
  --rcb-muted: #b7c4d7;
  --rcb-surface: #26354b;
}
```

Pass `className="my-chat"` and load overrides after the library CSS. The log scrolls as replies arrive only while the reader is near the bottom; scrolling up preserves their place.

## Headless hook

```tsx
import { useChatBot } from 'react-chat-bot42';

function CustomChat() {
  const { messages, isLoading, error, sendMessage, stop, clear, retry } =
    useChatBot({
      welcomeMessage: false,
      getResponse: async (input) => `You said: ${input}`,
    });
  return (
    <div>
      {messages.map((message) => (
        <p key={message.id}>{message.content}</p>
      ))}
      <button disabled={isLoading} onClick={() => void sendMessage('Hello')}>
        Say hello
      </button>
      {isLoading && <button onClick={stop}>Stop</button>}
      {error && <button onClick={() => void retry()}>Retry</button>}
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

`sendMessage(input)` and `retry()` return `Promise<boolean>`: `false` when rejected or unavailable, `true` when accepted (even if the provider subsequently fails or is cancelled). Inspect `error` and message status for the result.

```ts
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number; // Unix milliseconds
  status: 'complete' | 'streaming' | 'error' | 'cancelled';
}
```

Named exports include `ReactChatBot`, `useChatBot`, `getLocalReply`, `normalizeInput`, `Dprompts`, `DReplies`, `DnotFound`, and all public TypeScript types. The default export remains the component.

## Migrating from 0.7.x

1. Upgrade your application to React 18.2+ or React 19. React 16 is no longer supported. Repository development requires Node 22.12+.
2. Keep the default component import and the `PromptsBot`, `RepliesBot`, `notFoundBot`, `botIcon` and `userIcon` props. Custom prompt/reply props now work correctly.
3. Import `react-chat-bot42/styles.css`. The old `react-chat-bot42/dist/index.css` path remains an alias. Replace old Bootstrap/global CSS overrides with `.rcb` styles or CSS variables.
4. A welcome message now appears by default; set `welcomeMessage={false}` to hide it. The old hard-coded two-second delay is removed; use `responseDelay={2000}` if desired.
5. Default answers have been refreshed. Matching preserves numbers and international text and no longer applies the old English-specific phrase rewrites. Add aliases explicitly to your prompt groups when needed.
6. Direct `dist` JavaScript imports and undocumented internal modules are not public entry points. Use the package root.

## Development and validation

```sh
npm ci
npm run dev             # Vite example, local / streaming / error demos
npm run check           # types, behavioral tests, library + demo builds, actual tarball consumer
npm run test:watch
```

CI runs on Node 22/24 with React 18/19. The package test installs the tarball in an isolated consumer and verifies ESM, CommonJS, server rendering, both TypeScript export paths and CSS entry points. React is externalized from the library bundle. The demo deploys to the existing GitHub Pages branch after successful validation on `main`. npm publication remains a separate release step.

For a release, review the migration, choose the version, run `npm run check`, inspect `npm pack --dry-run`, and publish under an appropriate npm dist-tag (`latest` for stable releases or `next` for prereleases). Do not publish a prerelease to `latest` by accident.

MIT © Iñigo Romero. Legacy demo icons retained in `example/public` were attributed by the original project to [Smashicons](https://www.flaticon.com/authors/smashicons) and [Freepik](https://www.flaticon.com/authors/freepik) on Flaticon.
