# Changelog

## 1.0.0

### Breaking changes

- Require React 18.2+ / 19; develop with Node 22.12+.
- Replace legacy DOM mutations, global IDs and window.onload handlers with React state and effects.
- Scope all CSS under `.rcb`; replace Bootstrap-dependent markup and global selectors.
- Enable a welcome message by default, remove the fixed two-second reply delay, refresh local replies and preserve Unicode/numbers in matching.
- Expose explicit ESM/CommonJS/CSS exports instead of internal JavaScript paths.

### Added

- Full TypeScript API and a headless `useChatBot` hook.
- Async and streaming response providers with AbortSignal, stop, retry, typing state and stale-response protection.
- Optional bounded localStorage history, reset, seeded conversations and callbacks.
- Suggestions, translations, theme variables, custom message rendering and read-aloud controls.
- Accessible chat log, input labels, keyboard and IME handling, multi-instance support and SSR-safe imports.
- Vite demo, behavioral tests, real tarball consumer checks and React 18/19 CI.

### Fixed

- Custom prompt/reply props previously referenced an undefined `props` variable.
- User content now renders as text through React; matching no longer destroys displayed input.
- Remove obsolete Create React App/microbundle tooling and the invalid placeholder test.
