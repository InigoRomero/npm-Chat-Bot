import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import ReactChatBot from '../src';
it('hydrates the server markup before restoring browser history', async () => {
  const props = { storageKey: 'ssr', welcomeMessage: 'Welcome' };
  const element = document.createElement('div');
  element.innerHTML = renderToString(<ReactChatBot {...props} />);
  document.body.appendChild(element);
  expect(element.textContent).toContain('Welcome');
  localStorage.setItem(
    'ssr',
    JSON.stringify([
      {
        id: 'restored',
        role: 'assistant',
        content: 'Restored',
        status: 'complete',
        createdAt: 1,
      },
    ]),
  );
  const onRecoverableError = vi.fn();
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(element, <ReactChatBot {...props} />, {
      onRecoverableError,
    });
  });
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(element.textContent).toContain('Restored');
  await act(async () => root.unmount());
  element.remove();
});
