# João’s pixel playroom

Interactive portfolio checkpoint using locally vendored PixiJS 8.22.0 and individually generated layered pixel-art assets. This branch is a review build, not the live site.

## Run

Serve this directory over HTTP, for example `python3 -m http.server 8000`, then open http://localhost:8000. No build step or runtime CDN is required. PixiJS and its MIT license are included in `vendor/`; music and font provenance are in their asset directories.

## Features

Independent scene layers, calm idle motion, occasional cat/city/lamp events, click interactions, animated featured game cases and a nested game collection. Motion can be paused; music is opt-in. Featured entries are Voltorb Lab, Heimdall and Argus VLC SDK. PokéLens 3DS has descriptive content without a source link. Covers remain provisional.

## Checks

Run the dependency-free focused suites with `node tests/project-content.cjs`, `node tests/case-transition.cjs`, `node tests/collection-transition.cjs`, `node tests/passive-motion.cjs`, `node tests/ambient-events.cjs` and `node tests/click-eggs.cjs`. They cover content, lifecycle interruptions, motion anchoring and event timelines with deterministic mocks; they are not visual browser tests.

The optional `tests/isometric.cjs` browser harness requires Playwright and a served app, using `QA_URL=http://localhost:8000 node tests/isometric.cjs`. It was not rerun for this commit. Manual cloud Chromium Canvas checks covered desktop/narrow layout, cases/collection, focus return, pauses and interactions during development. Physical mobile, Safari and visual WebGL validation remain outstanding. PNG delivery size is not yet optimized.

## Polished header and delivery optimization

The name uses real extruded Three.js geometry and a locally bundled OFL-licensed Nunito Black subset. The approved static raster remains the fallback until GPU rendering succeeds and on context loss. A staggered 360-degree letter wave respects reduced motion, manual pause, dialogs and visibility. Three.js MIT and Nunito OFL notices are included.

Lossless WebP versions retain exactly identical decoded RGBA pixels and dimensions for all 32 room images. Originals remain as unsupported/load-failure fallbacks. Initial loading excludes the retained 3DS/ROG Ally variants. Room transfer is 31,632,808 bytes on the WebP path versus 45,814,850 bytes for the same PNG selection. Keeping both formats increases repository size; decoded texture memory is not reduced.

Egg controls wait for readiness; individual missing assets preserve the remaining scene and accessible project navigation. Canvas deformation now reuses fixed grid calculations and shared vertex positions without changing density or timing.

Additional suites: `node tests/room-loading.cjs`, `node tests/canvas-precompute.cjs`, `node tests/header-geometry.mjs`. All nine focused suites pass. Actual cloud Chromium Canvas checks covered delayed loading/early disabled taps, PNG fallback, missing-lamp recovery, featured cases, nested collection/focus cleanup and narrow layout. Live WebGL header/room rendering, physical mobile, Safari and GPU context-loss rendering remain unverified. Header motion was additionally inspected in an offline CPU render of production geometry; it is not live browser GPU evidence.
