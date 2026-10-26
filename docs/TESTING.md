# Current validation

See README.md for passed focused suites, actual Chromium Canvas checks and remaining live WebGL/mobile/Safari limits. No CI pipeline is configured in this checkpoint.

## Seated-character contact correction

`node tests/seated-contact.cjs` checks the lowered knee beyond the cushion's front
corner and below the real desk underside, shared registration at four
scene scales, old-leg removal and preservation of the original torso/hands/far
shoe and approved stem mask. `node tests/room-loading.cjs` also verifies the
whole-leg/arm/desk hierarchy with no distal override, positive character mask after mesh
replacement, 118.8 seconds of idle/reaction anchoring, WebP-to-PNG recovery,
and an intact original character if the correction asset is unavailable.

`node tests/seated-mesh.cjs` covers both the static WebGL mesh and scene-resolution
Canvas fallback, preserving the hip/shoe anchors and independent masks.

All 12 focused suites passed for this change. Production-equivalent offline
renders for both paths were independently inspected. Pixel checks verify the
original chair-arm and desk occluder composition, complete desk/leg overlap
coverage, and unchanged protected regions. These are geometry,
mock-renderer and offline image checks—not live browser/WebGL or responsive
layout evidence. Current execution isolation prevented a new browser run.
