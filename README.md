# João’s pixel playroom

Interactive portfolio checkpoint using locally vendored PixiJS 8.22.0 and individually generated layered pixel-art assets. This branch is a review build, not the live site.

## Run

Serve this directory over HTTP, for example `python3 -m http.server 8000`, then open http://localhost:8000. No build step or runtime CDN is required. PixiJS and its MIT license are included in `vendor/`; music and font provenance are in their asset directories.

## Features

Independent scene layers, calm idle motion, occasional cat/city/lamp events, click interactions, animated featured game cases and a nested game collection. Motion can be paused; music is opt-in. Featured entries are Voltorb Lab, Heimdall and Argus VLC SDK. PokéLens 3DS has descriptive content without a source link. Covers remain provisional.

## Checks

Run the dependency-free focused suites with `node tests/project-content.cjs`, `node tests/case-transition.cjs`, `node tests/collection-transition.cjs`, `node tests/passive-motion.cjs`, `node tests/ambient-events.cjs` and `node tests/click-eggs.cjs`. They cover content, lifecycle interruptions, motion anchoring and event timelines with deterministic mocks; they are not visual browser tests.

The optional `tests/isometric.cjs` browser harness requires Playwright and a served app, using `QA_URL=http://localhost:8000 node tests/isometric.cjs`. It was not rerun for this commit. Manual cloud Chromium Canvas checks covered desktop/narrow layout, cases/collection, focus return, pauses and interactions during development. Physical mobile, Safari and visual WebGL validation remain outstanding. PNG delivery size is not yet optimized.
