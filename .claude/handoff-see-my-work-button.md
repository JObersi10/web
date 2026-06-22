# Handoff: "See my work" button visual bug (needs browser verification)

## Context
Repo: `jobersi10/web` — personal portfolio site (static HTML/CSS/JS, no build step).
Branch: `claude/modest-lamport-8orua0`, PR #16 (https://github.com/JObersi10/web/pull/16).
This session had **no working headless browser** (sandboxed, no network access to
download Chromium via Playwright — `cdn.playwright.dev` blocked, no system `chromium-cli`).
All fixes below were made *blind*, reasoning from CSS only. **They are unverified.**
First thing to do in a session with real browser access: load the page, reproduce, confirm
or refute each theory before changing anything further.

## The bug (as reported by user)
On the homepage (`index.html`), in the About section, there's a "See my work →" button
(`.btn-accent` inside `#home-about`, links to `portfolio.html`). The user reported it
"clipping" — screenshot showed only the bottom rounded half of the pill button visible,
with the top half (including the button text) missing/hidden, even though there was
plenty of vertical gap before the next section ("What I Do" / Services pill) below it.

Later clarified: bug happens on **desktop** width. Also reported a **second, worse**
variant at in-between "square" window sizes (between mobile ~768px breakpoint and full
desktop, e.g. ~900-1100px), where "logos and stuff" clip even more.

Multiple attempted fixes (see commit history on this branch) did **not** resolve it,
per user follow-up ("still not fixed" — twice). Last action taken was a "drastic"
defensive fix (see below) which has **not yet been confirmed** by the user.

## Relevant structure (file: `style.css`, file: `index.html`)

- `#home-about` — the About section. Height is driven by `#about-scroll-track`
  (line ~817), whose height is set dynamically by JS (`script.js` ~line 433-436):
  `track.style.height = calc(100vh + maxWords*52 + 320px)`. `maxWords` comes from
  counting words in `[data-word-reveal]` paragraphs — if that selector ever matches
  zero/wrong content, the track could end up much shorter than expected.
- `#about-scroll-track` has `overflow: clip` (line ~821).
- `.about-sticky` (line ~824) is `position: sticky; top: 0; height: 100vh;`
  — originally `overflow: hidden`, changed to `overflow: visible` in this session
  (commit "Fix See My Work button clipping by removing about-sticky overflow clip on desktop").
  Inside it (in DOM order): heading, body text, `.about-stats-wrap` (stats numbers +
  floating client logo cards), then `<a class="btn-accent">See my work →</a>`.
- `.about-stats-wrap` (line ~950) is `position: relative`. Its child `.clients-cards-row`
  is `position: absolute; inset: 0` containing 4 `.client-card` divs (`.cc-1`..`.cc-4`,
  the floating Bright Club / Bloempot / Step by Step / Hack Club logo cards seen in the
  screenshot). These are positioned at the wrap's corners and have an "explode" entrance
  animation + continuous float animation (translateY oscillation, see `@keyframes
  explode-c1..4` and `cc-float-1..4`, lines ~1037-1092).
- **Leading theory (acted on, unconfirmed):** because `.about-stats-wrap` is
  `position: relative`, CSS paint order rules put it (and its absolutely-positioned
  descendants, the floating logo cards) *above* later **static** siblings like the
  plain `.btn-accent` anchor, regardless of DOM order or vertical distance. If the
  floating cards' animated/explosion positions extend down far enough (corners were
  originally offset `top:-14px`/`bottom:-14px`, i.e. *outside* the wrap's own box),
  they could visually paint over the button and hide its top half — the dark card
  background (`var(--surface)`) blending into the dark page background would look
  exactly like "clipping" rather than an obviously distinct overlapping card.

## Fixes applied so far, in order (all on branch `claude/modest-lamport-8orua0`)

1. Removed `iframe` clearing issue in portfolio lightbox (unrelated bug, confirmed fixed
   — `closeModal()` in `script.js` now clears `#modal-media` innerHTML so embedded videos
   stop playing on close). **Not part of this bug**, just noting it's also in this branch.
2. Increased about-section scroll track buffer 200px → 320px (commit "Increase
   about-section scroll buffer..."). **Did not fix it** per user.
3. Changed `.about-sticky` overflow `hidden` → `visible` (base rule, not just the
   `max-width:768px` mobile override) (commit "Fix See My Work button clipping by
   removing about-sticky overflow clip on desktop"). **Did not fix it** per user.
4. After seeing the screenshot, diagnosed the floating-card stacking-order theory above.
   Added `position: relative; z-index: 5;` to `#home-about .btn-accent` (commit "Fix See
   My Work button being hidden behind floating client-logo cards"). **User reported
   still not fixed** (no new screenshot given for this attempt).
5. "Drastic" fix (commit "Drastically isolate See My Work button and contain floating
   logo cards within their wrap"), **not yet confirmed**:
   - Changed `.cc-1`/`.cc-2` `top: -14px` → `top: 6px`, `.cc-3`/`.cc-4` `bottom: -14px`
     → `bottom: 6px` — pulls all 4 floating cards fully inside `.about-stats-wrap`'s own
     box so they can no longer geometrically extend past it toward the button.
   - `#home-about .btn-accent` now has `position: relative !important; isolation:
     isolate; z-index: 9999 !important;` and `margin-top` bumped `sp-8` → `sp-12`.

## What to do next (with browser access)

1. `git fetch origin claude/modest-lamport-8orua0 && git checkout claude/modest-lamport-8orua0`
2. Serve statically, e.g. `python3 -m http.server 8910` from repo root, open
   `http://localhost:8910/index.html`.
3. Use a real headless browser (Playwright/Chromium via `chromium-cli` if available, or
   `npx playwright install chromium` if network egress to `cdn.playwright.dev` is allowed
   in that environment — it was NOT allowed in this session).
4. Scroll to the About section at a **desktop viewport** (e.g. 1440×900) and at an
   **in-between "square" viewport** (e.g. 900×900, 1024×1024) — the user said the square
   size was "way worse." Screenshot both, during and after the floating-card explosion
   animation settles (the animation runs once on scroll-trigger, so wait ~1-2s after the
   stats come into view).
5. If the button is now fully visible and the text shows: confirmed fixed, can simplify
   the `!important`/`9999` overkill in fix #5 down to something more reasonable once
   actually verified (currently it's "make it definitely work" over "make it tasteful").
6. If still broken: open the actual browser DevTools and inspect computed styles /
   stacking context on `.btn-accent` directly to find the *real* overlapping element —
   don't keep guessing blind. Check in particular:
   - Whether `#about-scroll-track`'s JS-computed height is actually large enough (log
     `track.style.height` and compare to `.about-sticky`'s rendered bottom).
   - Whether some other ancestor (e.g. `.page-wrap`, `body`, or a transform-creating
     parent) is establishing a clipping/stacking context not accounted for here.
   - Whether the "square" viewport bug is the *same* root cause or a distinct layout
     issue (e.g. `.about-stats { flex-wrap: wrap }` wrapping into more rows at that
     width, changing `.about-stats-wrap`'s height and therefore the cards' real position
     relative to the button).
