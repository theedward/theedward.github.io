# Browser regression suite

Prepared and syntax-checked, **not executed end-to-end in this workspace**. Actual interaction verification was performed in Chromium; see `docs/TESTING.md`. Do not interpret this script's existence as a passing run.

From the repository root:

```sh
npm install
npx playwright install chromium
npm test
```

The default opens `../index.html` relative to this test file. To test a local server, set `QA_URL=http://127.0.0.1:8000`. To use an existing Chromium, set `CHROMIUM_PATH=/path/to/chromium`; otherwise Playwright's bundled Chromium is used.

Screenshots and JSON results are written to `tests/results/` (ignored). Tests cover shelf/list dialogs, animated-close settling, focus/keyboard loops, project links, eggs, native-audio opt-in/toggle, canvas pause/resume, session-stable props, narrow layouts, and reduced-motion emulation. Audio media files must be available locally or through the test server.

This suite intentionally does not visit external project links, deploy the site, or change repository state.
