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

/* ── Magnetic buttons (desktop only) ── */
function setupMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (prefersReducedMotion) return;
    document.querySelectorAll('.btn-accent, .btn-outline').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width  / 2) * 0.28;
            const y = (e.clientY - r.top  - r.height / 2) * 0.28;
            btn.style.transition = 'transform 0.1s ease';
            btn.style.transform  = `translate(${x}px,${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.5s cubic-bezier(0.2,1,0.3,1)';
            btn.style.transform  = '';
        });
    });
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
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
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

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupPortfolio();
    setupBackToTop();
    setupGrain();
    setupMagnetic();
    setupScramble();
    setupEasterEgg();

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
