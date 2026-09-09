import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const root = process.cwd();
mkdirSync('work', { recursive: true });
const temp = mkdtempSync(resolve('work/package-consumer-'));
const run = (command, args, cwd = temp) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
try {
  const packed = JSON.parse(
    run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temp],
      root,
    ),
  )[0];
  const files = packed.files.map((file) => file.path);
  for (const file of [
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/index.d.cts',
    'dist/index.css',
    'README.md',
    'LICENSE',
  ])
    assert(files.includes(file), `Missing ${file}`);
  assert(
    !files.some(
      (file) => file.startsWith('src/') || file.startsWith('example/'),
    ),
  );
  for (const entry of ['index.js', 'index.cjs'])
    assert(
      readFileSync(resolve('dist', entry), 'utf8').startsWith('"use client";'),
    );
  writeFileSync(
    resolve(temp, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  const require = createRequire(import.meta.url);
  const version = require('react/package.json').version;
  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    resolve(temp, packed.filename),
    `react@${version}`,
    `react-dom@${version}`,
  ]);
  const common = `import assert from 'node:assert/strict';\nimport { createElement } from 'react';\nimport { renderToString } from 'react-dom/server';\nimport Bot, { getLocalReply } from 'react-chat-bot42';\nassert(renderToString(createElement(Bot, { welcomeMessage: 'Server render works' })).includes('Server render works'));\nassert.equal(typeof getLocalReply('hello'), 'string');\n`;
  writeFileSync(resolve(temp, 'consume.mjs'), common);
  writeFileSync(
    resolve(temp, 'consume.cjs'),
    `const assert = require('node:assert/strict');\nconst {createElement} = require('react');\nconst {renderToString} = require('react-dom/server');\nconst {default: Bot} = require('react-chat-bot42');\nassert(renderToString(createElement(Bot)).includes('How can I help'));\nassert(require.resolve('react-chat-bot42/styles.css'));\nassert(require.resolve('react-chat-bot42/dist/index.css'));`,
  );
  run(process.execPath, ['consume.mjs']);
  run(process.execPath, ['consume.cjs']);
  const typed = `import Bot, { useChatBot, type ResponseProvider, type ReactChatBotProps } from 'react-chat-bot42';\nconst provider: ResponseProvider = async function* (input, { signal }) { if (!signal.aborted) yield input; };\nconst props: ReactChatBotProps = { getResponse: provider };\nvoid [Bot, useChatBot, props];\n`;
  for (const extension of ['mts', 'cts'])
    writeFileSync(resolve(temp, `consume.${extension}`), typed);
  run(process.execPath, [
    resolve(root, 'node_modules/typescript/bin/tsc'),
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--target',
    'ES2022',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    'consume.mts',
    'consume.cts',
  ]);
  console.log(
    `Package verified: ${packed.filename}, React ${version}, ESM + CommonJS + SSR + TypeScript + CSS exports.`,
  );
} catch (error) {
  console.error(error.stdout?.toString() ?? '', error.stderr?.toString() ?? '');
  throw error;
} finally {
  rmSync(temp, { recursive: true, force: true });
}
