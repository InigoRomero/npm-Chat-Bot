import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactChatBot from '../../src';
import type { ResponseProvider } from '../../src';
import '../../src/styles.css';
import './index.css';
const streaming: ResponseProvider = async function* (input, { signal }) {
  const answer = `You asked: “${input}”. This reply streams one word at a time. Replace getResponse with your own backend to connect a real assistant.`;
  for (const word of answer.split(' ')) {
    if (signal.aborted) return;
    await new Promise((resolve) => setTimeout(resolve, 70));
    if (signal.aborted) return;
    yield `${word} `;
  }
};
function App() {
  const [mode, setMode] = useState('local');
  const [dark, setDark] = useState(false);
  return (
    <main className={dark ? 'demo dark' : 'demo'}>
      <nav>
        <a href="https://github.com/InigoRomero/npm-Chat-Bot">
          chatbot<span>42</span>
        </a>
        <a href="https://github.com/InigoRomero/npm-Chat-Bot#readme">
          Documentation ↗
        </a>
      </nav>
      <div className="layout">
        <div className="intro">
          <span className="eyebrow">REACT 19 · TYPESCRIPT · OPEN SOURCE</span>
          <h1>
            A little chat.
            <br />A lot of possibility.
          </h1>
          <p>
            Start with a simple conversation. Make it your own with local
            answers, streamed responses, and an interface that fits your
            product.
          </p>
          <div className="features">
            <span>↗ Your backend</span>
            <span>◎ Accessible controls</span>
            <span>▷ Read replies aloud</span>
          </div>
          <code>npm install react-chat-bot42</code>
          <p className="preview-note">
            This is a preview of the next major release. The published npm
            version may differ.
          </p>
          <div className="controls">
            <label>
              Response mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
              >
                <option value="local">Local replies</option>
                <option value="stream">Streaming demo</option>
                <option value="error">Error & retry demo</option>
              </select>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={dark}
                onChange={(event) => setDark(event.target.checked)}
              />{' '}
              Dark theme
            </label>
          </div>
        </div>
        <div className="chat-preview">
          <ReactChatBot
            key={mode}
            className={dark ? 'dark-chat' : ''}
            title="Your helpful assistant"
            speech
            welcomeMessage="Hello! Try a suggestion below, or write me a message."
            suggestions={
              mode === 'local'
                ? ['Hello', 'What can you do', 'Who are you']
                : ['How does this work?']
            }
            responseDelay={mode === 'local' ? 400 : 0}
            getResponse={
              mode === 'stream'
                ? streaming
                : mode === 'error'
                  ? () => {
                      throw new Error('Demo failure');
                    }
                  : undefined
            }
          />
          <p className="caption">
            {mode === 'local'
              ? 'Local answers · No network requests'
              : mode === 'stream'
                ? 'Simulated streaming · Try the Stop button'
                : 'Intentional failure · Test the retry flow'}
          </p>
        </div>
      </div>
      <footer>
        Built by Iñigo Romero <span>MIT licensed · Bring your own backend</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
