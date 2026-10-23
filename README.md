# João Seixas — My playroom

A buildless, dependency-free portfolio prototype. Open `index.html` or serve this directory with any static web server. It works at a GitHub Pages root or subdirectory: all local references are relative.

```sh
python3 -m http.server 8080
# Visit http://localhost:8080
```

## What is real / what is a placeholder

- The room is **original code-native pixel art**, not an AI image covered with hotspots. `room.js` draws distinct walls, window/skyline, furniture, character, plants, props, rug and cat at a 480 × 300 pixel resolution.
- Project cases are semantic HTML buttons, aligned to the canvas shelf. Every case is also available through the plain project list below the room.
- Voltorb Lab points to the known public repository, `https://github.com/theedward/voltorb-flip`. Its role/contribution and final case-study text are **unconfirmed**, and are explicitly marked as such. No work experience, impact metric, shipped achievement, or contribution has been invented.
- The remaining two projects are **selection TBD** placeholders. Cover illustrations are original concepts, not project screenshots. The Voltorb detail illustration is an explicitly labeled illustrative 5 × 5 board; factual feature copy comes from the public repository README.
- About copy is a minimal draft based on the brief, not a verified professional biography.
- Stylized personal nods are drawn from code: green/white Sporting scarf, red Horde-inspired crest, League-inspired frame, blue-ring football, surfboard, Mac mini-inspired computer, collectible, and handheld consoles. They are not licensed game screenshots or official logo assets.
- The family frame intentionally has four abstract silhouettes and no real faces. The user's portrait is not bundled or publicly exposed.
- **No Miniclip branding. No external music.** Opt-in sound uses “Afterglow,” an original 93 BPM synthwave draft made from synthesis, with no samples or external track. This is not MOKKA or a licensed recording of the reference. There are no trackers, cookies, network fetches, runtime font services, or dependencies. The locally bundled Press Start 2P font is licensed under the SIL Open Font License (see `assets/fonts/OFL.txt`).

## Edit guide

| File         | Purpose                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `index.html` | Intro, navigation, project cover buttons, plain project list, dialog skeletons                   |
| `style.css`  | Layout, pixel-case covers, responsive behavior, accessible focus styling, case-opening animation |
| `room.js`    | All original canvas artwork and local idle/egg animations                                        |
| `app.js`     | `PROJECTS` content at the top; dialogs, keyboard behavior, media preferences, optional audio     |

To replace a placeholder, update its `PROJECTS` record in `app.js`, then update the associated shelf button and plain list label in `index.html`. Keep IDs `data-project="0"`, `1`, `2` aligned. Do not remove placeholder disclosures until contribution/content and screenshots are confirmed. Add images only with permission and meaningful alt text; do not present cover concepts as screenshots.

The 960 × 600 logical scene is rendered at half resolution for crisp pixel art. HTML overlay percentages are relative to this scene. Mobile intentionally crops 12% from the left with the scene expanded to 120%; overlay positions are adjusted in the final media rules. If moving artwork, also move the matching `.monitor`, `.cat`, `.headphones`, or `.cases` CSS positions.

## Interaction & accessibility

- Shelf case → zoom from selected case → hinged detail dialog. Close button, Escape, or backdrop dismissal folds the case shut and returns it toward its trigger, then restores focus. Reduced-motion preference makes this immediate. The room settles while a dialog is open and restores the previous motion preference afterward.
- Native `dialog` with explicit Tab wrapping; keyboard-only access to all controls.
- Project quick view below the room is available on mobile and desktop; no hover-only navigation.
- Monitor cycles code, puzzle concept, and planet screens. Ahri reacts with blue eyes and a heart. Headphones show notes (visual only).
- Ambient motion: clouds, distant bird, plant leaves, cat breathing, typing hand, planet screensaver, and subtle lamp warmth.
- Motion respects `prefers-reduced-motion`, with an explicit pause/resume control. Pausing stops the canvas animation loop. Static interactive responses remain available.
- Audio is off by default with `preload="none"`; fetching and playback require an explicit button click. It pauses in background tabs and resumes only if the visitor had opted in. Audio preference is never persisted. OGG is preferred with an MP3 fallback, at 12% volume. No autoplay and no third-party track.
- Handheld variation is chosen once per browser tab session, stored in `sessionStorage` (Switch-, 3DS-, or ROG Ally-inspired). Positions do not randomize.

## Validation

`node --check room.js && node --check app.js` validates JavaScript syntax. Browser interaction tests and visual QA results are tracked separately in the handoff. `qa/` contains developmental canvas captures and should not be published with the site. The room canvas can also be rendered offline using `@napi-rs/canvas` in the QA environment; this is a development-only tool, **not** a site dependency.

## Known limitations / next content pass

- Final project selection, actual product screenshots, contribution wording, and professional intro need the owner's editorial approval.
- Current artwork is deliberately stylized pixel art. Character and branding are small-scale suggestions, not exact portrait/logo reproductions.
- No contact email has been invented. Contact currently leads to the owner's known GitHub profile.
- No deployment, production domain change, or merge is performed by this package. Publishing requires a separate authorized step.

### Font credit

Press Start 2P by CodeMan38, redistributed under SIL OFL 1.1. Source: https://github.com/google/fonts/tree/main/ofl/pressstart2p. Font and original license are bundled in `assets/fonts/`.

### Audio provenance and validation

See `assets/audio/CREDITS.md`. The 41.29-second original draft loop was synthesized and checked programmatically for decoding and clipping. Browser play/pause state is tested separately. Subjective listening and seamless-loop behavior on every device are not claimed; HTML audio looping can have a small scheduling gap on some browsers.
