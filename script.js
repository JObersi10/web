const projects = [
    {
        title: 'Horizon Campaign',
        cat: 'Brand Film',
        year: '2024',
        featured: true,
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
        desc: 'A cinematic brand film shot across the northern coast of Curaçao exploring the infinite horizon.'
    },
    {
        title: 'Salt & Shore',
        cat: 'Documentary',
        year: '2023',
        img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=2071&auto=format&fit=crop',
        desc: 'Short documentary following traditional fishermen captured entirely in golden-hour natural light.'
    },
    {
        title: 'Machina',
        cat: 'Experimental',
        year: '2023',
        img: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1974&auto=format&fit=crop',
        desc: 'Experimental macro series blending mechanical industry with organic movement.'
    }
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const UI = {
    cursor:     document.getElementById('cursor'),
    hero:       document.getElementById('hero-name'),
    grid:       document.getElementById('portfolio-grid'),
    modal:      document.getElementById('modal'),
    mobileMenu: document.getElementById('mobile-menu'),
    body:       document.body
};

/* ── Custom cursor ── */
let lastMouse = { x: 0, y: 0 };
let cursorAngle = 0;

function setupCursor() {
    if (!UI.cursor) return;
    if (window.matchMedia('(hover: none)').matches) {
        UI.cursor.style.display = 'none';
        return;
    }
    if (prefersReducedMotion) {
        UI.cursor.style.display = 'none';
        return;
    }

    let idleTimer;
    function resetIdle() {
        UI.cursor.style.opacity = '1';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { UI.cursor.style.opacity = '0'; }, 3000);
    }

    window.addEventListener('mousemove', e => {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isExpanded = UI.cursor.classList.contains('active');
        const intensity = isExpanded ? 0.01 : 0.15;
        const stretch = Math.min(dist * intensity, 0.4);

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        }

        UI.cursor.style.left = `${e.clientX}px`;
        UI.cursor.style.top  = `${e.clientY}px`;
        UI.cursor.style.transform = `translate(-50%,-50%) rotate(${cursorAngle}deg) scale(${1 + stretch},${1 - stretch})`;

        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;

        UI.cursor.classList.toggle('active', !!e.target.closest('button,a,.btn-accent,.btn-outline,.nav-link,.portfolio-card'));
        resetIdle();
    });

    window.addEventListener('mouseout', e => {
        if (!e.relatedTarget && !e.toElement) {
            UI.cursor.style.opacity = '0';
            clearTimeout(idleTimer);
        }
    });

    window.addEventListener('mouseover', resetIdle);
}

/* ── Fit hero name to viewport width ── */
function fitHero() {
    if (!UI.hero) return;
    UI.hero.style.fontSize = '100px';
    const ratio = (window.innerWidth * 0.94) / UI.hero.scrollWidth;
    UI.hero.style.fontSize = `${Math.min(Math.max(100 * ratio, 40), 272)}px`;
}

/* ── Film grain ── */
function setupGrain() {
    if (prefersReducedMotion) return;
    const el = document.createElement('div');
    el.id = 'grain';
    document.body.appendChild(el);
}

/* ── Magnetic buttons — proximity snap (desktop only) ── */
function setupMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;

    const ATTRACT_RADIUS = 110; // px — how far the pull starts
    const STRENGTH       = 0.52; // how strong the snap is

    const magnets = [...document.querySelectorAll('.btn-accent, .btn-outline')];
    if (!magnets.length) return;

    window.addEventListener('mousemove', e => {
        magnets.forEach(btn => {
            const r  = btn.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ATTRACT_RADIUS) {
                const factor = Math.pow(1 - dist / ATTRACT_RADIUS, 1.6) * STRENGTH;
                btn.style.transition = 'transform 0.12s cubic-bezier(0.2,1,0.3,1), box-shadow 0.2s ease';
                btn.style.transform  = `translate(${dx * factor}px, ${dy * factor}px)`;
            } else {
                btn.style.transition = 'transform 0.55s cubic-bezier(0.2,1,0.3,1), box-shadow 0.3s ease';
                btn.style.transform  = '';
            }
        });
    }, { passive: true });
}

/* ── Logo text scramble on hover (desktop only) ── */
function setupScramble() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;
    document.querySelectorAll('.nav-logo').forEach(logo => {
        const textNode = [...logo.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (!textNode) return;
        const span = document.createElement('span');
        span.textContent = textNode.textContent.trim();
        logo.replaceChild(span, textNode);
        const original = span.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$@';
        let rafId, iteration;
        logo.addEventListener('mouseenter', () => {
            cancelAnimationFrame(rafId);
            iteration = 0;
            (function run() {
                span.textContent = original.split('').map((ch, i) =>
                    i < Math.floor(iteration) ? original[i] : chars[Math.floor(Math.random() * chars.length)]
                ).join('');
                iteration += 0.4;
                if (iteration < original.length) rafId = requestAnimationFrame(run);
                else span.textContent = original;
            })();
        });
        logo.addEventListener('mouseleave', () => {
            cancelAnimationFrame(rafId);
            span.textContent = original;
        });
    });
}

/* ── Portfolio grid ── */
function setupPortfolio() {
    if (!UI.grid) return;
    UI.grid.innerHTML = projects.map((p, i) => `
        <div class="portfolio-card reveal ${p.featured ? 'featured' : ''}" onclick="openModal(${i})" role="button" tabindex="0" aria-label="View project: ${p.title}">
            <div class="card-bg" style="background-image:url('${p.img}')"></div>
            <div class="card-info">
                <span class="card-tag">${p.cat}</span>
                <div class="card-title">${p.title}</div>
                <div class="card-year">${p.year}</div>
            </div>
        </div>`).join('');

    // keyboard support for cards
    UI.grid.querySelectorAll('.portfolio-card').forEach((card, i) => {
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); }
        });
    });
}

function openModal(index) {
    const p = projects[index];
    if (!p || !UI.modal) return;
    document.getElementById('m-title').innerText = p.title;
    document.getElementById('m-tag').innerText   = p.cat;
    document.getElementById('m-year').innerText  = p.year;
    document.getElementById('m-desc').innerText  = p.desc;
    document.getElementById('modal-media').innerHTML = `<img src="${p.img}" alt="${p.title}" loading="lazy">`;
    UI.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (UI.modal) UI.modal.classList.remove('open');
    document.body.style.overflow = '';
}

/* ── Mobile menu ── */
function toggleMenu(state) {
    if (UI.mobileMenu) UI.mobileMenu.classList.toggle('open', state);
    document.body.style.overflow = state ? 'hidden' : '';
}

/* ── Page transition ── */
function navTo(url) {
    if (prefersReducedMotion) {
        window.location.href = url;
        return;
    }
    UI.body.style.opacity = '0';
    UI.body.style.transition = 'opacity 0.35s ease';
    setTimeout(() => window.location.href = url, 350);
}

/* ── Back to top ── */
function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    // scroll listener is registered in the unified scroll handler below
    btn._el = btn;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
    return btn;
}

/* ── Easter egg: 3 clicks on cover image ── */
function setupEasterEgg() {
    let count = 0, timer;
    const el = document.getElementById('pfp-easter-egg');
    if (!el) return;
    el.addEventListener('click', () => {
        count++;
        if (!prefersReducedMotion) {
            el.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.06) rotate(-3deg)' },
                { transform: 'scale(1)' }
            ], { duration: 200, easing: 'ease-in-out' });
        }
        if (navigator.vibrate) navigator.vibrate(40);
        clearTimeout(timer);
        timer = setTimeout(() => { count = 0; }, 2000);
        if (count >= 3) { count = 0; triggerRickRoll(); }
    });
}

function triggerRickRoll() {
    if (document.getElementById('rickroll-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'rickroll-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.98);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
        <div style="position:relative;width:100%;max-width:800px;aspect-ratio:16/9;background:#000;border:2px solid #333;">
            <button onclick="document.getElementById('rickroll-overlay').remove()" aria-label="Close"
                style="position:absolute;top:-40px;right:0;color:#fff;background:none;border:none;cursor:pointer;font-family:sans-serif;font-weight:700;text-transform:uppercase;font-size:14px;">
                Close [X]
            </button>
            <iframe width="100%" height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen
                title="Rick Astley - Never Gonna Give You Up">
            </iframe>
        </div>`;
    document.body.appendChild(overlay);
}

/* ── Curaçao idle letter glow ── */
function setupCuracaoIdle() {
    const letters = [...document.querySelectorAll('.curacao-mark .w-letter')];
    if (!letters.length || prefersReducedMotion) return;

    let activeIdx = -1;
    setInterval(() => {
        // un-glow previous
        if (activeIdx >= 0) letters[activeIdx].classList.remove('idle-glow');
        // pick a new random letter (avoid same twice)
        let next;
        do { next = Math.floor(Math.random() * letters.length); } while (next === activeIdx);
        activeIdx = next;
        letters[activeIdx].classList.add('idle-glow');
    }, 1800);
}

/* ── Curaçao click — stars burst upward ── */
function triggerCuracaoStars(e) {
    if (prefersReducedMotion) return;
    const cx = e.clientX;
    const cy = e.clientY;

    // also pop the mark element
    const mark = e.currentTarget;
    mark.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
        { duration: 320, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
    );

    // two stars: one small + one big
    const configs = [
        { size: 11, dx: -28, color: '#fbbf24', delay: 0,   rot: 140 },
        { size: 24, dx:  22, color: '#fbbf24', delay: 90,  rot: -200 },
    ];

    configs.forEach(cfg => {
        const el = document.createElement('div');
        el.style.cssText = `
            position:fixed;
            left:${cx}px; top:${cy}px;
            width:${cfg.size}px; height:${cfg.size}px;
            background:${cfg.color};
            clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);
            pointer-events:none; z-index:9999;
        `;
        document.body.appendChild(el);

        el.animate([
            { transform: 'translate(-50%,-50%) scale(0) rotate(0deg)',                              opacity: 1 },
            { transform: `translate(calc(-50% + ${cfg.dx * 0.35}px),-70%) scale(1.3) rotate(${cfg.rot * 0.4}deg)`, opacity: 1, offset: 0.22 },
            { transform: `translate(calc(-50% + ${cfg.dx}px), -200%) scale(0.7) rotate(${cfg.rot}deg)`,           opacity: 0 }
        ], {
            duration: 780,
            delay: cfg.delay,
            easing: 'cubic-bezier(0.22,1,0.36,1)',
            fill: 'forwards'
        });

        setTimeout(() => el.remove(), 780 + cfg.delay + 50);
    });
}

/* ── Scroll-driven word-by-word reveal ── */
function setupWordReveal() {
    const paragraphs = document.querySelectorAll('[data-word-reveal]');
    if (!paragraphs.length) return;

    // 1. Split each paragraph's text nodes into .word-unit spans, track per-paragraph
    const paragraphWordSets = []; // array of arrays — one per paragraph

    paragraphs.forEach(p => {
        let localIdx = 0;
        // Filter: skip text nodes inside .hackclub-badge
        const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return node.parentElement.closest('.hackclub-badge')
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT;
            }
        }, false);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) textNodes.push(node);

        textNodes.forEach(tn => {
            const parts = tn.textContent.split(/(\s+)/);
            const frag  = document.createDocumentFragment();
            parts.forEach(part => {
                if (/^\s+$/.test(part) || part === '') {
                    frag.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.className = 'word-unit';
                    span.dataset.wi = localIdx++;
                    span.textContent = part;
                    frag.appendChild(span);
                }
            });
            tn.parentNode.replaceChild(frag, tn);
        });

        paragraphWordSets.push([...p.querySelectorAll('.word-unit')]);
    });

    const maxWords = Math.max(...paragraphWordSets.map(s => s.length));
    if (!maxWords) return;

    // 2. Reduced-motion: show everything immediately, skip scroll animation
    if (prefersReducedMotion) {
        paragraphWordSets.flat().forEach(w => w.classList.add('active'));
        const markEl = document.querySelector('.curacao-mark');
        if (markEl) markEl.classList.add('marker-active');
        document.querySelectorAll('.about-float').forEach(f => f.classList.add('pop-in'));
        const editorial = document.querySelector('.about-editorial');
        if (editorial) editorial.classList.add('photos-split'); // show both photos immediately
        return;
    }

    // 3. Track height — based on longest paragraph × px-per-word
    const track = document.getElementById('about-scroll-track');
    const PX_PER_WORD = 52;
    if (track) {
        track.style.height = `calc(100vh + ${maxWords * PX_PER_WORD + 200}px)`;
    }

    // 4. Find "running" word in its paragraph for badge thump timing
    let runningSet = null, runningLocalIdx = -1;
    paragraphWordSets.forEach(words => {
        words.forEach((w, i) => {
            if (w.textContent.trim().toLowerCase() === 'running') {
                runningSet = words; runningLocalIdx = i;
            }
        });
    });

    // 5. Scroll → STAGGERED parallel reveal
    //    Para 1 runs  0% → 65% of scroll
    //    Para 2 starts at 55% (overlaps near last sentence of para 1) → 100%
    const paraSchedule = [
        { start: 0.0, end: 0.65 },
        { start: 0.55, end: 1.0  },
    ];

    const section  = document.getElementById('home-about');
    const badge    = document.querySelector('.hackclub-badge');
    const mark     = document.querySelector('.curacao-mark');
    const editorial = document.querySelector('.about-editorial'); // cached — don't re-query per frame
    let badgeThumped = false, markerFired = false;
    let prevRunningReveal = 0;

    function updateWords() {
        if (!section) return;
        const rect     = section.getBoundingClientRect();
        const trackH   = section.offsetHeight - window.innerHeight;
        const progress = trackH > 0 ? Math.max(0, Math.min(1, -rect.top / trackH)) : 0;

        paragraphWordSets.forEach((words, pi) => {
            const sched = paraSchedule[pi] || { start: 0, end: 1 };
            const local = Math.max(0, Math.min(1, (progress - sched.start) / (sched.end - sched.start)));
            const reveal = Math.floor(local * words.length);
            words.forEach((w, i) => w.classList.toggle('active', i < reveal));
        });

        // Badge thump
        if (!badgeThumped && runningSet && runningLocalIdx >= 0) {
            const pi = paragraphWordSets.indexOf(runningSet);
            const sched = paraSchedule[pi] || { start: 0, end: 1 };
            const local = Math.max(0, Math.min(1, (progress - sched.start) / (sched.end - sched.start)));
            const paraReveal = Math.floor(local * runningSet.length);
            if (prevRunningReveal <= runningLocalIdx && paraReveal > runningLocalIdx) {
                badgeThumped = true;
                if (badge) {
                    badge.classList.remove('thump');
                    void badge.offsetWidth;
                    badge.classList.add('thump');
                    setTimeout(() => badge.classList.remove('thump'), 850);
                }
            }
            prevRunningReveal = paraReveal;
        }

        if (!markerFired && mark && progress > 0.02) {
            markerFired = true;
            mark.classList.add('marker-active');
        }

        // Mobile photo split (pfp left, star right) at para 2
        if (editorial) editorial.classList.toggle('photos-split', progress >= 0.55);

        // Desktop: pfp always visible once section in view; star pops at para 2
        if (window.innerWidth > 1024) {
            if (floatLeft && !floatLeft.classList.contains('pop-in')) floatLeft.classList.add('pop-in');
            if (floatRight) floatRight.classList.toggle('pop-in', progress >= 0.55);
        }
    }

    // Desktop float elements
    const floatLeft  = document.querySelector('.about-float-left');
    const floatRight = document.querySelector('.about-float-right');

    updateWords();
    return updateWords;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupPortfolio();
    setupBackToTop();
    setupGrain();
    setupMagnetic();
    setupScramble();
    setupEasterEgg();
    const updateWords = setupWordReveal();
    setupCuracaoIdle();

    // ── Unified scroll handler — ONE rAF per frame for all scroll effects ──
    const backTopBtn = setupBackToTop();
    const bgGrad     = document.getElementById('bg-grad');
    const bgBloom    = document.getElementById('bg-bloom');
    const footerEl   = document.getElementById('site-footer');
    let scrollTick   = false;

    function onScroll() {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;

            // Back to top button
            if (backTopBtn) backTopBtn.classList.toggle('visible', y > 400);

            // Cutting mat parallax — each layer drifts at its own speed
            if (bgGrad && !prefersReducedMotion) {
                const d45 = (y * 0.20).toFixed(1);
                const d30 = (y * 0.12).toFixed(1);
                const dG  = (y * 0.28).toFixed(1);
                // 5 layers: 45°, 30°, 60°, h-grid, v-grid
                bgGrad.style.backgroundPosition =
                    `left -${d45}px, left -${d30}px, left -${d30}px, 0 -${dG}px, -${dG}px 0`;
            }

            // Clip bg overlays off the footer as it gets revealed
            if (footerEl && (bgGrad || bgBloom)) {
                const maxScroll = document.body.scrollHeight - window.innerHeight;
                const footerH   = footerEl.offsetHeight;
                const revealed  = Math.max(0, y - (maxScroll - footerH));
                const clip      = revealed + 'px';
                if (bgGrad)  bgGrad.style.bottom  = clip;
                if (bgBloom) bgBloom.style.bottom = clip;
            }

            // Word reveal
            if (updateWords) updateWords();

            scrollTick = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init state

    // ── "About Me" hero button — cinematic slow scroll through about section ──
    const aboutBtn     = document.getElementById('about-me-btn');
    const aboutSection = document.getElementById('home-about');
    if (aboutBtn && aboutSection) {
        aboutBtn.addEventListener('click', e => {
            e.preventDefault();
            const target   = aboutSection.getBoundingClientRect().top + window.scrollY;
            const trackEl  = document.getElementById('about-scroll-track');
            const trackEnd = trackEl
                ? target + trackEl.offsetHeight - window.innerHeight
                : target;
            const start    = window.scrollY;
            const distance = trackEnd - start;
            const duration = Math.min(5500, Math.max(2600, Math.abs(distance) * 2.2));
            let startTime  = null;

            // easeOutQuart — rockets fast, then decelerates into the text reveal
            function easeOutQuart(t) {
                return 1 - Math.pow(1 - t, 4);
            }
            function step(ts) {
                if (!startTime) startTime = ts;
                const elapsed  = ts - startTime;
                const progress = Math.min(elapsed / duration, 1);
                window.scrollTo(0, start + distance * easeOutQuart(progress));
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    // Curaçao click — stars burst
    const curacaoMark = document.querySelector('.curacao-mark');
    if (curacaoMark) {
        curacaoMark.addEventListener('click', triggerCuracaoStars);
    }

    document.fonts.ready.then(() => {
        fitHero();
        window.addEventListener('resize', fitHero, { passive: true });
    });

    /* Scroll reveal */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal, .service-card, .gear-card').forEach(el => revealObserver.observe(el));

    /* javii-reveal (blur + slide) */
    const javiiObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                javiiObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -16px 0px' });

    document.querySelectorAll('.javii-reveal').forEach((el, i) => {
        if (!prefersReducedMotion) {
            el.style.transitionDelay = `${i * 0.045}s`;
        }
        javiiObserver.observe(el);
    });

    /* Skill bars */
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) bar.style.width = `${bar.dataset.p}%`;
        }, { threshold: 0.4 }).observe(bar);
    });

    /* Stat count-up (ease-out cubic, fires once on viewport entry) */
    document.querySelectorAll('.about-stat-num').forEach(el => {
        const target   = parseInt(el.textContent, 10);
        const accentEl = el.querySelector('.accent');
        const suffix   = accentEl ? accentEl.textContent : '';
        if (isNaN(target) || prefersReducedMotion) return;
        el.innerHTML = '0' + (suffix ? `<span class="accent">${suffix}</span>` : '');
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            const start = performance.now();
            (function tick(now) {
                const t = Math.min(1, (now - start) / 1100);
                const cur = Math.floor((1 - Math.pow(1 - t, 3)) * target);
                el.innerHTML = cur + (suffix ? `<span class="accent">${suffix}</span>` : '');
                if (t < 1) requestAnimationFrame(tick);
            })(start);
        }, { threshold: 0.5 });
        obs.observe(el);
    });

    /* Nav */
    document.getElementById('hamburger')?.addEventListener('click', () => toggleMenu(true));
    document.getElementById('m-close')?.addEventListener('click',   () => toggleMenu(false));

    document.querySelectorAll('a[data-nav]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            toggleMenu(false);
            navTo(link.getAttribute('href'));
        });
    });

    /* Modal close on backdrop click */
    UI.modal?.addEventListener('click', e => {
        if (e.target === UI.modal) closeModal();
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            toggleMenu(false);
        }
    });

    /* Fade in on page load */
    if (!prefersReducedMotion) {
        UI.body.style.opacity = '0';
        UI.body.style.transition = 'opacity 0.35s ease';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { UI.body.style.opacity = '1'; });
        });
    }
});
