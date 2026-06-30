# CLAUDE.md

Static personal portfolio site for JOBERSI (videographer/photographer based in Curaçao).
No build step, no package.json, no framework — plain HTML/CSS/JS served as-is. Test
locally with `python3 -m http.server 8910` from repo root and open `http://localhost:8910`.

## How the whole thing operates

**Pages** (all share the same `style.css` and `script.js`):

| Page            | Nav label | What's on it |
|-----------------|-----------|--------------|
| `index.html`    | (logo)    | Hero, the pinned About section (see below), Services, footer CTA |
| `portfolio.html`| Archive   | Grid of project cards (`#portfolio-grid`), click → lightbox modal with YouTube embed or image |
| `cv.html`       | CV        | Sidebar (skills/tech/education) + a scroll-drawn SVG "river" timeline (`setupCvRoad()`) |
| `gear.html`     | Lab       | Static gear/workflow listing, no images, no special JS |
| `contact.html`  | Connect   | Contact links/form, no images, no special JS |

**`script.js` structure** — one file, no modules, everything wired up inside a single
`DOMContentLoaded` listener at the bottom that calls each page's relevant setup functions
(each one early-returns via `if (!el) return` when its target element doesn't exist on the
current page, so it's safe to call all of them unconditionally on every page):

- `setupCursor()` — custom dot cursor (`#cursor`), follows the mouse, stretches with
  velocity, expands over links/buttons. Disabled entirely (`display:none`) on touch
  devices and for `prefers-reduced-motion`.
- `fitHero()` — shrinks the giant "JOBERSI" hero wordmark to fit the viewport width.
- `setupGrain()` — injects a `#grain` film-grain overlay div (skipped for reduced motion).
- `setupMagnetic()` — buttons that snap toward the cursor when nearby; caches
  `getBoundingClientRect()` instead of calling it per-`mousemove` (see Performance notes).
- `setupScramble()` — hover-scramble text effect on nav logo.
- `setupPortfolio()` / `openModal()` / `closeModal()` — Archive grid click handling and the
  lightbox modal (video embed or fallback `<img>`).
- `setupBackToTop()`, `setupEasterEgg()` (triple-click rickroll on the hero pfp),
  `setupCuracaoIdle()` / `triggerCuracaoStars()` (click the "Curaçao" text for a star burst).
- `setupHeroCharReveal()` — per-letter hero name animation.
- `setupWordReveal()` — the About section's word-by-word text reveal + scroll-track sizing.
  **This is the most fragile part of the codebase — read the dedicated section below before
  touching anything here.**
- `setupCvRoad()` — draws/animates the CV page's SVG river path as you scroll.
- A big unified `onScroll()` (inside the `DOMContentLoaded` callback, not its own named
  function) batches per-frame work for the back-to-top button, background parallax, footer
  bg-clip, word-reveal updates, and the CV road — one `requestAnimationFrame` per scroll
  event for all of it, not one per concern.
- `.javii-reveal` blur/slide-in elements (pill/heading/buttons across the site) and
  `.reveal` fade-ins are handled by `IntersectionObserver`s set up inline near the bottom of
  the `DOMContentLoaded` callback, not inside a named function.

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
  actually contain that content instead of clipping it. This matters for things that all
  have to stay in sync with it:
  1. **Word-reveal progress** (`updateWords()` in `script.js`) computes the pin's release
     point as `section.offsetHeight - aboutSticky.offsetHeight`, NOT
     `- window.innerHeight`. Using `innerHeight` there was a real bug: once `.about-sticky`
     could be taller than the viewport, that formula understated the pin distance and the
     section released early, cutting the word-by-word text reveal short (mid-sentence) on
     every viewport size, desktop included.
  2. **The "About Me" hero button's auto-scroll** (its click handler, also in
     `script.js`) computes its scroll target the same way and had the *exact same bug*,
     independently — it overshot past the pin's real end point for the same reason. Fixed
     the same way: use the sticky's real `offsetHeight`, not `window.innerHeight`. If you
     ever touch one of these two calculations, check the other one too — they're
     duplicated, not shared, and have drifted out of sync before.
  3. **Track height's overflow term** (above) — without it, `#home-services` starts (in
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
`prefersReducedMotion` early-return branch is **also taken for mobile viewports**
(`window.matchMedia('(max-width: 768px)').matches`): all words, the badge, the photo
split, and the floating cards are marked visible/active immediately instead of being tied
to scroll progress, because the scroll-tied math needs a held/pinned section to have enough
scroll distance to complete, and mobile doesn't pin. This was deliberately tried the other
way once (giving mobile the same pin as desktop) and reverted — the request at the time was
specifically to keep mobile non-pinned. If a future request wants the pin+reveal animation
restored on mobile, you'd need to: remove the mobile clause from that bypass, and remove
`height: auto` from `.about-sticky`'s mobile media-query override (let it inherit the base
`min-height: 100vh`) — both changes together, or you reproduce the "text cuts short" bug on
mobile instead of desktop.

**Important distinction inside that mobile bypass:** the word-by-word text reveal being
instant on mobile does NOT mean every animated element on the page should be forced instant
too. The `.javii-reveal` fade-in elements (heading, buttons, pill — used on every page, not
just About) are a *separate* mechanism (`IntersectionObserver`-driven CSS transition) and
should keep animating normally via real scroll-triggered intersection on every viewport,
mobile included. An earlier attempt forced `.javii-reveal` instantly active on mobile too,
reasoning that the observer "wasn't firing reliably" there — that diagnosis was wrong (it
was a test-script artifact: an instant `window.scrollTo()` jump skips the frame where the
browser would register the element as intersecting; a real gradual scroll doesn't). Forcing
it instant made the fade-in transition complete before the user ever scrolled the element
into view, so by the time they saw it, it looked like it had never animated at all — "just
sitting there like it's the end." Don't reach for "force it instant" as a fix for
reveal-animation bugs without first confirming the bug with a *gradual* simulated scroll,
not a single jump.

### The real reload edge case (and the over-correction it caused)

Browsers can restore scroll position after a reload via a single jump straight to the
restored offset, rather than a frame-by-frame scroll. If an element's intersection ratio
goes from "below the fold" (page just loaded, scroll 0) to "already scrolled past" (after
the restore) without ever crossing the `IntersectionObserver`'s threshold *in between*, the
observer never fires for it — not at load, and (confirmed by direct testing) not later
either, even if the user manually scrolls back up to where it would normally re-trigger.
This is a real, confirmed browser behavior, not a guess.

The first fix for this was a blind `window.addEventListener('load', …)` timeout that force-
revealed *any* `.javii-reveal` element already scrolled past — but that over-corrected: it
revealed elements before the user had scrolled back to see them, so when they did scroll up
to that point, the element was already in its final state with no animation to watch
(same symptom as the mobile over-correction above, different cause). The current fix
(`recheckJaviiVisibility()` near the bottom of the `DOMContentLoaded` callback) instead
re-derives intersection from real `getBoundingClientRect()` geometry, checked **only**:
(a) once, shortly after `load` (catches "the restored position already has this visible
right now"), and (b) on every subsequent `scroll` event (catches "scrolled back to
something the observer missed"). It never reveals something the user hasn't scrolled to.
If you need to debug this again, simulate a real reload with scroll restoration (CDP
`Page.reload` preserves scroll like a real browser does) and check state *before* and
*after* manually scrolling back, not just immediately after reload.

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
here that hid the `.pill`, shrank margins, and re-stated the photo sizes. It got removed —
`max-height: 900px` was unintentionally catching completely normal desktop resolutions
(1440×900), hiding the "ABOUT" pill and killing spacing on a window that had plenty of
room. Don't re-add a height-based squeeze without a much narrower, deliberately chosen
threshold (and re-check it against 1440×900 / 1366×768 / 1280×800 specifically), and don't
put it back if the only thing it's meant to "save" is button/stats fit at the bottom of the
section — that trade-off has already been made (see above).

### Testing this section in a headless browser

- Don't eyeball a `window.scrollTo` target computed from generic heuristics — verify you
  actually landed in the *pinned* range by checking
  `.about-sticky.getBoundingClientRect().top === 0` before reading any other element's
  position.
- The page has `scroll-behavior: smooth` on `<html>`. A raw `window.scrollTo()` will
  animate and you'll read stale/mid-animation positions if you check immediately. Set
  `document.documentElement.style.scrollBehavior = 'auto'` before programmatic scrolling
  in tests.
- **Simulate gradual scrolling, not a single jump**, when testing anything tied to
  `IntersectionObserver`. A single `window.scrollTo()` call can skip the frame where an
  element would register as intersecting — that's a test artifact, not how real scrolling
  (even a fast flick) behaves. Step through multiple smaller `scrollTo` calls with a short
  delay between them instead.
- No real browser/devtools MCP tool is guaranteed to be available in every session. A
  headless Chrome + raw CDP-over-WebSocket driver (Node 22+'s built-in `fetch`/`WebSocket`,
  no npm deps) works as a fallback — launch
  `Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --remote-debugging-port=9222`,
  open a target via `PUT /json/new`, and speak CDP directly. Disable cache
  (`Network.setCacheDisabled`) — Chrome will otherwise serve a stale `script.js` after an
  edit and any fix will look like it "did nothing." `Page.reload` preserves scroll position
  the same way a real browser reload does, useful for reproducing the reload-specific bugs
  above.
- To emulate a specific device (e.g. "test on an iPhone 12 Pro"), use
  `Emulation.setDeviceMetricsOverride` with that device's CSS viewport size (iPhone 12
  Pro: 390×844, deviceScaleFactor 3, mobile: true) plus a matching `Network.setUserAgentOverride`.

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

- `setupMagnetic()` (button proximity-snap effect) caches `getBoundingClientRect()`
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
  This is intentional (matches prior project history), not something to "fix" by splitting
  it up unless explicitly asked.
- No package.json / build tooling. Edits to `style.css` / `index.html` / `script.js` are
  live immediately on refresh (modulo browser cache — hard-reload when testing).
- `gear.html` (Lab) and `contact.html` (Connect) currently have no in-page images — nothing
  to optimize there image-wise; don't force changes onto those pages for the sake of
  symmetry with Archive/CV.

## Git/PR workflow

- **Don't run `gh pr create` (or otherwise open/publish a PR) without being explicitly told
  to.** Committing and pushing a branch is fine when asked; actually opening the PR on
  GitHub is a separate, more visible action and needs its own go-ahead. This was a real
  point of friction — the user was fine with branches/PRs existing, just not with them
  being auto-submitted without being asked first.
- This repo's GitHub Pages deployment serves from `main`, at `jobersi10.github.io/web`,
  configured at the repo level (not in this repo's files). Work sitting on any other
  branch — including an open PR — is **not live** until merged into `main`. If a reported
  bug "doesn't seem fixed," check whether you're looking at deployed `main` vs. an
  unmerged branch before assuming the fix didn't work.
- The intended PR base branch for this project is `A2`, not `main`, despite `main`
  currently being a commit or two ahead of `A2` (a merge went the unexpected direction at
  some point). Confirm with the user if this seems to have changed.
