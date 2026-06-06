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

const UI = {
    cursor: document.getElementById('cursor'),
    hero: document.getElementById('hero-name'),
    grid: document.getElementById('portfolio-grid'),
    modal: document.getElementById('modal'),
    mobileMenu: document.getElementById('mobile-menu'),
    body: document.body
};

let lastMouse = { x: 0, y: 0 };
let cursorAngle = 0;

function setupCursor() {
    if (!UI.cursor) return;
    // Don't run on touch-only devices
    if (window.matchMedia('(hover: none)').matches) {
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
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        const isExpanded = UI.cursor.classList.contains('active');
        const intensity = isExpanded ? 0.01 : 0.15;
        const stretchBase = Math.min(mouseDistance * intensity, 0.4);

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        }

        UI.cursor.style.left = `${e.clientX}px`;
        UI.cursor.style.top = `${e.clientY}px`;
        UI.cursor.style.transform = `translate(-50%, -50%) rotate(${cursorAngle}deg) scale(${1 + stretchBase}, ${1 - stretchBase})`;

        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;

        const isHoverable = e.target.closest('button, a, .btn-accent, .btn-outline, .nav-link');
        UI.cursor.classList.toggle('active', !!isHoverable);

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

function fitHero() {
    if (!UI.hero) return;
    UI.hero.style.fontSize = '100px';
    const ratio = (window.innerWidth * 0.94) / UI.hero.scrollWidth;
    UI.hero.style.fontSize = `${Math.min(Math.max(100 * ratio, 48), 272)}px`;
}

function setupGrain() {
    const el = document.createElement('div');
    el.id = 'grain';
    document.body.appendChild(el);
}

function setupMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.btn-accent, .btn-outline').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.3;
            const y = (e.clientY - r.top - r.height / 2) * 0.3;
            btn.style.transition = 'transform 0.1s ease';
            btn.style.transform = `translate(${x}px, ${y}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)';
            btn.style.transform = '';
        });
    });
}

function setupScramble() {
    if (window.matchMedia('(hover: none)').matches) return;
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

function setupPortfolio() {
    if (!UI.grid) return;
    UI.grid.innerHTML = projects.map((p, i) => `
        <div class="portfolio-card reveal ${p.featured ? 'featured' : ''}" onclick="openModal(${i})">
            <div class="card-bg" style="background-image:url('${p.img}')"></div>
            <div class="card-info">
                <span class="card-tag">${p.cat}</span>
                <div class="card-title">${p.title}</div>
                <div class="card-year">${p.year}</div>
            </div>
        </div>`).join('');
}

function openModal(index) {
    const p = projects[index];
    if (!p || !UI.modal) return;
    document.getElementById('m-title').innerText = p.title;
    document.getElementById('m-tag').innerText = p.cat;
    document.getElementById('m-year').innerText = p.year;
    document.getElementById('m-desc').innerText = p.desc;
    document.getElementById('modal-media').innerHTML = `<img src="${p.img}" alt="${p.title}" />`;
    UI.modal.classList.add('open');
}

function closeModal() {
    if (UI.modal) UI.modal.classList.remove('open');
}

function toggleMenu(state) {
    if (UI.mobileMenu) UI.mobileMenu.classList.toggle('open', state);
}

function navTo(url) {
    UI.body.style.opacity = '0';
    setTimeout(() => window.location.href = url, 400);
}

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupPortfolio();
    setupBackToTop();
    setupGrain();
    setupMagnetic();
    setupScramble();
    document.fonts.ready.then(() => {
        fitHero();
        window.addEventListener('resize', fitHero);
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible', 'active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .service-card, .gear-card').forEach(el => revealObserver.observe(el));

    const javiiObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.javii-reveal').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.05}s`;
        javiiObserver.observe(el);
    });

    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) bar.style.width = `${bar.dataset.p}%`;
        }, { threshold: 0.5 }).observe(bar);
    });

    document.getElementById('hamburger')?.addEventListener('click', () => toggleMenu(true));
    document.getElementById('m-close')?.addEventListener('click', () => toggleMenu(false));

    document.querySelectorAll('a[data-nav]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            toggleMenu(false);
            navTo(link.getAttribute('href'));
        });
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            toggleMenu(false);
        }
    });

    // Easter egg: 3 clicks on profile picture
    let pfpClickCount = 0;
    let pfpClickTimer;
    const pfp = document.getElementById('pfp-easter-egg');

    pfp?.addEventListener('click', () => {
        pfpClickCount++;
        pfp.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1) rotate(-5deg)' },
            { transform: 'scale(1)' }
        ], { duration: 200, easing: 'ease-in-out' });
        if (navigator.vibrate) navigator.vibrate(50);
        clearTimeout(pfpClickTimer);
        pfpClickTimer = setTimeout(() => { pfpClickCount = 0; }, 2000);
        if (pfpClickCount >= 3) {
            pfpClickCount = 0;
            triggerRickRoll();
        }
    });
});

function triggerRickRoll() {
    if (document.getElementById('rickroll-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'rickroll-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.98);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
        <div style="position:relative;width:100%;max-width:800px;aspect-ratio:16/9;background:#000;border:2px solid #333;box-shadow:0 0 50px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('rickroll-overlay').remove()"
                style="position:absolute;top:-40px;right:0;color:#fff;background:none;border:none;cursor:pointer;font-family:sans-serif;font-weight:700;text-transform:uppercase;font-size:14px;">
                Close [X]
            </button>
            <iframe width="100%" height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        </div>
    `;
    document.body.appendChild(overlay);
}
