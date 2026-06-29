# CLAUDE.md

Static personal portfolio site. No build step — `index.html`, `style.css`, `script.js`
(plus `contact.html`, `cv.html`, `gear.html`, `portfolio.html`, sharing the same
`style.css`/`script.js`) are served as-is. Test locally with
`python3 -m http.server 8910` from repo root.

## The About section is a pinned scroll-jacked frame — read this before touching it

`#home-about` (in `index.html`) is NOT a normal scrolling section. Structure:

- `#about-scroll-track` — height is set by JS (`script.js`, `updateTrackHeight()` inside
  `setupWordReveal()`) to `100vh + maxWords*52 + 320px + overflow`, where `overflow` is a
  **live-measured** value: however much `.about-editorial`'s real rendered height (in its
  tallest state — photos split, cards exploded) exceeds the viewport. This is just scroll
  *distance*, not visible space.
- `.about-sticky` — `position: sticky; top: 0; min-height: 100vh; overflow: visible`.
  **It's `min-height`, not a fixed `height`** — on viewports where the content is taller
  than 100vh (short/square aspect ratios, e.g. 900×900 or 1280×800), the box grows to
  actually contain that content instead of clipping it. This matters for two things that
  both have to stay in sync with it:
  1. **Word-reveal progress** (`updateWords()` in `script.js`) computes the pin's release
     point as `section.offsetHeight - aboutSticky.offsetHeight`, NOT
     `- window.innerHeight`. Using `innerHeight` there was a real bug this session — once
     `.about-sticky` could be taller than the viewport, that formula understated the pin
     distance and the section released early, cutting the word-by-word text reveal short
     (mid-sentence) on every viewport size, desktop included. If you ever change
     `.about-sticky` back to a fixed height, you'd need to revert this too — but don't,
     see next point.
  2. **Track height's overflow term** (above) — without it, `#home-services` starts (in
     document flow) before the sticky's overflowing tail (cards/stats/button) has fully
     scrolled past, and the two visibly clip into / overlap each other.
- Whatever fits inside the (now content-sized) sticky box is all that's visible while
  pinned; content below the visible area is reachable only once the pin releases and the
  page scrolls normally past it. On short/square viewports the stats/button can end up
  sitting low or right at the edge — this is an accepted trade-off (images and text were
  prioritized over guaranteeing the button never overflows), not a bug to "fix" by
  shrinking things again.

### Mobile (`max-width: 768px`) does NOT use the pin

`.about-sticky` switches to `height: auto`, normal in-flow scrolling (no pin) — this is
intentional, not a regression. Correspondingly, `setupWordReveal()`'s
`prefersReducedMotion` early-return branch in `script.js` is **also taken for mobile
viewports** (`window.matchMedia('(max-width: 768px)').matches`): all words, the badge, the
photo split, and the floating cards are marked visible/active immediately instead of
being tied to scroll progress. This was a deliberate choice (reverted once already this
session after trying the opposite — see git history around "iPhone SE" / "stay put till
the end" — the user asked for it back). If a future request wants the pin+reveal
animation restored on mobile too, you'd need to: remove the mobile clause from that
bypass, and remove `height: auto` from `.about-sticky`'s mobile media-query override (let
it inherit the base `min-height: 100vh`) — both changes together, not one without the
other, or you reproduce the "text cuts short" bug on mobile instead of desktop.

### Cascade-order trap

CSS specificity ties break by **source order in the file**, not by where you physically
paste new code. A media-query override placed *before* an unconditional rule with equal
specificity loses to that later unconditional rule even when the media query matches. Any
override added to this section's spacing must be placed **after** the base
`.about-sticky`, `.about-stats-wrap`, `.about-editorial .section-heading`, etc. rules it's
meant to beat — verify with `getComputedStyle()` in a real browser, don't assume the
cascade from reading the file once.

### Floating client-logo cards (`.cc-1`–`.cc-4`)

Positioned with `top`/`bottom` inside `.about-stats-wrap` (`position: relative`).
`.about-stats-wrap` has `min-height: 190px` (base rule, not squeeze-gated) specifically so
the top corner cards (`cc-1`/`cc-2`, 86px tall) and bottom corner cards (`cc-3`/`cc-4`,
86px tall) never clip into each other — below 184px (6+86+86+6) of wrap height, they
overlap. Don't remove that `min-height` without re-deriving the math if the card
sizes/offsets ever change.

There was previously a `@media (min-width: 769px) and (max-height: 900px)` "squeeze" block
here that hid the `.pill`, shrank margins, and re-stated the photo sizes. It got removed
this session — `max-height: 900px` was unintentionally catching completely normal desktop
resolutions (1440×900), hiding the "ABOUT" pill and killing spacing on a window that had
plenty of room. Don't re-add a height-based squeeze without a much narrower, deliberately
chosen threshold (and re-check it against 1440×900 / 1366×768 / 1280×800 specifically), and
don't put it back if the only thing it's meant to "save" is button/stats fit at the bottom
of the section — that trade-off has already been made (see above).

### Testing this section in a headless browser

- Don't eyeball a `window.scrollTo` target computed from generic heuristics — verify you
  actually landed in the *pinned* range by checking
  `.about-sticky.getBoundingClientRect().top === 0` before reading any other element's
  position.
- The page has `scroll-behavior: smooth` on `<html>`. A raw `window.scrollTo()` will
  animate and you'll read stale/mid-animation positions if you check immediately. Set
  `document.documentElement.style.scrollBehavior = 'auto'` before programmatic scrolling
  in tests.
- `.javii-reveal` elements (pill/heading/button) fade in via `IntersectionObserver` + CSS
  transition. If the page loads already scrolled past one (Chrome restores scroll
  position on reload, often *after* `DOMContentLoaded`), it can land directly in the
  "already exited" state without ever passing through "entering", so the observer never
  fires and the element is stuck invisible. There's a `window.addEventListener('load', …)`
  recheck in `script.js` for exactly this — if you see something invisible after a reload
  that's fine on a fresh load, check that recheck still covers it before assuming it's a
  new bug.
- No real browser/devtools MCP tool is guaranteed to be available in every session. A
  headless Chrome + raw CDP-over-WebSocket driver (Node 22+'s built-in `fetch`/`WebSocket`,
  no npm deps) works as a fallback — launch
  `Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --remote-debugging-port=9222`,
  open a target via `PUT /json/new`, and speak CDP directly. Disable cache
  (`Network.setCacheDisabled`) — Chrome will otherwise serve a stale `script.js` after an
  edit and any fix will look like it "did nothing."

## Image conventions

- YouTube thumbnails used as small/dimmed card backgrounds (`.card-bg` in
  `portfolio.html`) should use `hqdefault.jpg` (480×360), not `maxresdefault.jpg`
  (1280×720) — the extra resolution is invisible at that size and roughly doubles+ the
  page weight per card. The `data-img` attribute (used by the lightbox modal for any card
  *without* a `data-video`) should stay full-resolution.
- Don't save photographic content as PNG — it's lossless and 3–4x larger than an
  equivalent-quality JPEG for no visible benefit on a photo. Only use PNG for things that
  actually need transparency or sharp flat-color edges (icons, graphics).
- Below-the-fold `<img>` tags should have `loading="lazy" decoding="async"`.

## Performance notes

- `setupMagnetic()` in `script.js` (button proximity-snap effect) caches `getBoundingClientRect()`
  results (refreshed only on scroll/resize) and batches work through `requestAnimationFrame`
  rather than calling `getBoundingClientRect()` inside the raw `mousemove` handler. If adding
  similar proximity/parallax/cursor-follow effects, follow this pattern: cache geometry reads,
  gate per-event work behind rAF, never call `getBoundingClientRect()` inside a high-frequency
  event handler directly.
- `#cursor`'s base CSS rule has `opacity: 0` — it starts at `top:0;left:0` before the first
  mousemove, so without that it flashes visibly in the corner on load. `script.js` sets
  `opacity: 1` on the first real mouse movement.

## General

- Single global stylesheet (`style.css`) shared by every page — no CSS modules/scoping.
  This is intentional (see prior project history), not something to "fix" by splitting it
  up unless explicitly asked.
- No package.json / build tooling. Edits to `style.css` / `index.html` / `script.js` are
  live immediately on refresh (modulo browser cache — hard-reload when testing).
- `gear.html` (Lab) and `contact.html` (Connect) currently have no in-page images — nothing
  to optimize there image-wise; don't force changes onto those pages for the sake of
  symmetry with Archive/CV.
