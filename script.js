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

let mouse = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };
let cursorAngle = 0;

function setupCursor() {
    if (!UI.cursor) return;

    window.addEventListener('mousemove', e => {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        const mouseDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if cursor is currently expanded
        const isExpanded = UI.cursor.classList.contains('active');
        
        // Restore original 0.15 intensity for small state
        // Drop to 0.01 for big state to keep it from overreacting
        const intensity = isExpanded ? 0.01 : 0.15;
        const stretchBase = Math.min(mouseDistance * intensity, 0.4); 

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        }

        // Direct positioning (no smoothing/lag)
        UI.cursor.style.left = `${e.clientX}px`;
        UI.cursor.style.top = `${e.clientY}px`;
        
        UI.cursor.style.transform = `translate(-50%, -50%) rotate(${cursorAngle}deg) scale(${1 + stretchBase}, ${1 - stretchBase})`;

        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;

        const target = e.target;
        const isHoverable = target.closest('button, a, .btn-accent, .btn-outline, .nav-link');
        UI.cursor.classList.toggle('active', !!isHoverable);
    });
    // Add these inside setupCursor()
window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && !e.toElement) {
        UI.cursor.style.opacity = '0';
    }
});

window.addEventListener('mouseover', () => {
    UI.cursor.style.opacity = '1';
});
}

function fitHero() {
    if (!UI.hero) return;
    UI.hero.style.fontSize = '100px';
    const ratio = (window.innerWidth * 0.94) / UI.hero.scrollWidth;
    UI.hero.style.fontSize = `${Math.min(Math.max(100 * ratio, 48), 272)}px`;
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

document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupPortfolio();
    fitHero();
    
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .service-card, .gear-card').forEach(el => revealObserver.observe(el));

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

    window.addEventListener('resize', fitHero);
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
            toggleMenu(false);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { 
        threshold: 0.05, // Trigger earlier
        rootMargin: "0px 0px -20px 0px" 
    });

    const textElements = document.querySelectorAll('.javii-reveal');
    textElements.forEach((el, index) => {
        // Faster stagger (0.05s)
        el.style.transitionDelay = `${index * 0.05}s`; 
        observer.observe(el);
    });
});

// Easter Egg: Trigger after 3 clicks
let pfpClickCount = 0;
let pfpClickTimer;
const pfp = document.getElementById('pfp-easter-egg');

pfp?.addEventListener('click', () => {
    pfpClickCount++;
    
    // Animation for feedback
    pfp.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1) rotate(-5deg)' },
        { transform: 'scale(1)' }
    ], { duration: 200, easing: 'ease-in-out' });
    
    if (navigator.vibrate) navigator.vibrate(50);

    // Reset counter if time exceeds 2 seconds
    clearTimeout(pfpClickTimer);
    pfpClickTimer = setTimeout(() => { pfpClickCount = 0; }, 2000);

    // Trigger at 3 clicks
    if (pfpClickCount >= 3) {
        pfpClickCount = 0;
        triggerRickRoll();
    }
});

function triggerRickRoll() {
    if (document.getElementById('rickroll-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = "rickroll-overlay";
    // Using fixed positioning and full viewport coverage
    overlay.style.cssText = "position: fixed; inset: 0; z-index: 999999; background: rgba(0,0,0,0.98); display: flex; align-items: center; justify-content: center; padding: 20px;";
    
    overlay.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: #000; border: 2px solid #333; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('rickroll-overlay').remove()" 
                style="position: absolute; top: -40px; right: 0; color: #fff; background: none; border: none; cursor: pointer; font-family: sans-serif; font-weight: 700; text-transform: uppercase; font-size: 14px;">
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