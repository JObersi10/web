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

function navTo(url) {
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = url;
    }, 400);
}

function openMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('open');
}

function closeMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.remove('open');
}

function setupCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;

    window.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    function tick() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        requestAnimationFrame(tick);
    }

    tick();
}

function setupRevealObserver() {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .service-card, .gear-card').forEach(el => revealObserver.observe(el));
}

function setupHeroFit() {
    const heroEl = document.getElementById('hero-name');
    if (!heroEl) return;

    function fitHero() {
        heroEl.style.fontSize = '';
        const available = window.innerWidth * 0.94;
        heroEl.style.fontSize = '100px';
        const ratio = available / heroEl.scrollWidth;
        const computed = Math.min(Math.max(100 * ratio, 48), 272);
        heroEl.style.fontSize = `${computed}px`;
    }

    window.addEventListener('resize', fitHero, { passive: true });
    fitHero();
}

function setupSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    if (skillBars.length === 0) return;

    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = `${entry.target.dataset.p}%`;
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

function setupPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = `portfolio-card reveal${project.featured ? ' featured' : ''}`;
        card.innerHTML = `
            <div class="card-bg" style="background-image:url('${project.img}')"></div>
            <div class="card-info">
                <span class="card-tag">${project.cat}</span>
                <div class="card-title">${project.title}</div>
                <div class="card-year">${project.year}</div>
            </div>`;
        card.addEventListener('click', () => openModal(index));
        grid.appendChild(card);
    });
}

function openModal(index) {
    const project = projects[index];
    if (!project) return;

    const modal = document.getElementById('modal');
    const title = document.getElementById('m-title');
    const tag = document.getElementById('m-tag');
    const year = document.getElementById('m-year');
    const desc = document.getElementById('m-desc');
    const media = document.getElementById('modal-media');

    if (title) title.innerText = project.title;
    if (tag) tag.innerText = project.cat;
    if (year) year.innerText = project.year;
    if (desc) desc.innerText = project.desc;
    if (media) media.innerHTML = `<img src="${project.img}" alt="${project.title}" />`;
    if (modal) modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');
}

function setupMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger');
    const closeBtn = document.getElementById('m-close');
    if (!mobileMenu) return;
    if (hamburger) hamburger.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
}

function bindPageLinks() {
    document.querySelectorAll('a[data-nav]').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            closeMenu();
            navTo(link.getAttribute('href'));
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupCursor();
    setupHeroFit();
    setupMobileMenu();
    setupPortfolio();
    setupSkillBars();
    setupRevealObserver();
    bindPageLinks();

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
            closeMenu();
        }
    });
});
