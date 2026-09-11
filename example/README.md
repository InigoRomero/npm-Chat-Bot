# Interactive example

**[Open the live demo](https://inigoromero.github.io/npm-Chat-Bot/)** — try the chatbot directly in your browser.

From the repository root, with Node 22.12+:

```sh
npm ci
npm run dev
```

Open the local Vite URL. Switch between local answers, simulated streaming and an intentional error to try retries. Toggle the theme and use the speech buttons in browsers with speech synthesis support. The demo makes no backend requests and does not persist conversations.

`npm run build:example` produces `example/dist`. Set Vite's `--base=/npm-Chat-Bot/` when building for that GitHub Pages subpath. The Deploy demo workflow builds with this base and publishes to the existing `gh-pages` branch after changes to `main` pass validation.

The demo imports library source for fast development; `npm run test:package` separately checks the actual npm tarball in a consumer project.
