document.addEventListener('DOMContentLoaded', () => {
    // 1. Unified Custom Cursor
    // The cursor is maintained in index.html as requested
    const cursor = document.getElementById('cursor');
    if (cursor) {
        let mx = 0, my = 0, cx = 0, cy = 0;
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

    // 2. Universal Intersection Observer for Reveal Animations
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal, .service-card, .gear-card').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Skill Bar Logic (Specific to CV page)
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    if (skillBars.length > 0) {
        const skillObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.dataset.p + '%';
                }
            });
        }, { threshold: 0.5 });
        skillBars.forEach(b => skillObserver.observe(b));
    }

    // 4. Hero Text Auto-Fit (Specific to Index page)
    const heroEl = document.getElementById('hero-name');
    if (heroEl) {
        function fitHero() {
            heroEl.style.fontSize = '';
            const available = window.innerWidth * 0.94;
            heroEl.style.fontSize = '100px';
            const ratio = available / heroEl.scrollWidth;
            const computed = Math.min(Math.max(100 * ratio, 48), 280);
            heroEl.style.fontSize = computed + 'px';
        }
        window.addEventListener('resize', fitHero);
        fitHero();
    }
});

// Shared Navigation Utility
function navTo(url) {
    document.body.style.opacity = '0';
    setTimeout(() => location.href = url, 400);
}