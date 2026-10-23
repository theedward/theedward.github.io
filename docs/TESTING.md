# Verification record

Verified on 22 October 2026 against this implementation in Chromium. This is a review build, not a production launch.

## Passed in the browser

- All three shelf cases and corresponding list controls open the correct entry. Only the verified Voltorb repository has an external project link.
- Case zoom/hinge opening and folding return; Close, Escape and backdrop dismissal restore focus and scrolling.
- Keyboard focus wraps within dialogs. About is keyboard accessible.
- Repeated and cross-trigger open/close stress tests, including a focus race found and fixed.
- Room motion settles behind dialogs and restores the previous pause/run preference.
- Paused scene captures are pixel-identical; resumed captures differ.
- Monitor, Ahri and headphone interactions respond and announce their result.
- Handheld selection stays stable across reloads of the same tab session.
- Audio starts unloaded and paused; only explicit opt-in starts playback. Mute pauses it; reload does not autoplay.
- Desktop layout has no horizontal overflow. A 333 CSS-pixel narrow window was checked through native window sizing and browser zoom; project controls remained reachable.
- No site-origin JavaScript errors during exercised flows.

## Additional checks

- `node --check room.js`, `node --check app.js`, and test-script syntax passed.
- Local HTML/CSS asset references were checked. Fonts and audio are bundled; no runtime third-party dependency.
- Original audio was decoded and numerically checked for duration and peaks; listening quality was not independently auditioned.

## Not claimed

- The portable Playwright suite was prepared and syntax-checked, not run end-to-end here.
- No physical iPhone/Android/Safari test, touch-device emulation or OS reduced-motion emulation. Reduced-motion logic is implemented; manual pause was verified.
- MP3 fallback and background-tab audio resume were not forced in the browser.
- Project selection, actual screenshots, contribution copy and final music remain editorial decisions.

Use `npm test` in a suitable local environment for the portable regression suite, and complete device/music review before merging for launch.
