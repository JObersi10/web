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
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        const dx = mouse.x - lastMouse.x;
        const dy = mouse.y - lastMouse.y;
        
        // Update angle only if moving to prevent snapping to 0
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            cursorAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        }
        
        const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.15, 0.6);

        UI.cursor.style.left = `${mouse.x}px`;
        UI.cursor.style.top = `${mouse.y}px`;
        UI.cursor.style.transform = `translate(-50%, -50%) rotate(${cursorAngle}deg) scale(${1 + speed}, ${1 - speed})`;

        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;

        clearTimeout(UI.cursor.timeout);
        UI.cursor.timeout = setTimeout(() => {
            UI.cursor.style.transform = `translate(-50%, -50%) rotate(${cursorAngle}deg) scale(1, 1)`;
        }, 150);
    });

    window.addEventListener('mousedown', () => {
        UI.cursor.style.transform += ' scale(0.6)';
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

function setupScrollSquircle() {
    const squircle = document.getElementById('scroll-squircle');
    const startSection = document.getElementById('home-about');
    const endSection = document.getElementById('home-services');
    
    if (!squircle || !startSection || !endSection) return;

    window.addEventListener('scroll', () => {
        const startRect = startSection.getBoundingClientRect();
        const endRect = endSection.getBoundingClientRect();
        
        // Point where animation starts (About section enters)
        const startPoint = startRect.top; 
        // Point where animation finishes (Services section starts)
        const endPoint = endRect.top;

        // Total distance between the two sections
        const totalDistance = endPoint - startPoint;
        
        // Calculate progress based on how much of that gap we've scrolled
        // 0 = At the start of About, 1 = Reached What I Do
        let progress = (window.innerHeight - startRect.top) / (endRect.top - startRect.top + window.innerHeight);
        
        progress = Math.max(0, Math.min(1, progress));

        if (progress > 0) {
            const scale = progress * 90;
            const radius = 30 - (progress * 30);
            const blur = progress * 10; // 3. Blur grows with the image
            
            squircle.style.opacity = Math.min(progress * 1.5, 0.5);
            squircle.style.transform = `translate(-50%, -50%) scale(${scale})`;
            squircle.style.borderRadius = `${radius}%`;
            squircle.style.filter = `blur(${blur}px)`;
        } else {
            squircle.style.opacity = "0";
        }
    }, { passive: true });
}