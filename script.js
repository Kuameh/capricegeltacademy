/* ============================================
   CGA Landing Page — JavaScript
   ============================================ */

// --- Scroll-triggered Fade-In Animations ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Frosted Nav on Scroll ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    const fadeEls = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => observer.observe(el));

    // --- Radar Center Live Ticker ---
    const symbols = ['AAPL', 'XAU', 'EUR/USD', 'OIL', 'TSLA', 'GBP/USD', 'AMZN', 'BRENT'];
    const liveRate = document.getElementById('live-rate');
    let symbolIdx = 0;

    if (liveRate) {
        setInterval(() => {
            symbolIdx = (symbolIdx + 1) % symbols.length;
            liveRate.style.opacity = '0';
            setTimeout(() => {
                liveRate.textContent = symbols[symbolIdx];
                liveRate.style.opacity = '1';
            }, 300);
        }, 2500);
        liveRate.style.transition = 'opacity 0.3s ease';
    }

    // --- Smooth scroll for nav links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Counter animation for stat values ---
    const statValues = document.querySelectorAll('.stat-block h4');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('counted');
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statValues.forEach(el => statObserver.observe(el));

    // --- Ticker jitter (randomise percentage changes) ---
    const tickerItems = document.querySelectorAll('.ticker-item');
    setInterval(() => {
        tickerItems.forEach(item => {
            const changeEl = item.querySelector('.up, .down');
            if (changeEl) {
                const isUp = Math.random() > 0.35;
                const val = (Math.random() * 3).toFixed(1);
                changeEl.textContent = isUp ? `▲ +${val}%` : `▼ -${val}%`;
                changeEl.className = isUp ? 'up' : 'down';
            }
        });
    }, 4000);

    // --- Video Card: Play/Pause + Progress ---
    const video = document.getElementById('preview-video');
    const playBtn = document.getElementById('video-play-btn');
    const progressBar = document.getElementById('video-progress-bar');
    const videoCard = document.getElementById('video-card');

    if (video && playBtn) {
        const togglePlay = () => {
            if (video.paused) {
                video.play();
                playBtn.classList.add('playing');
            } else {
                video.pause();
                playBtn.classList.remove('playing');
            }
        };

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });

        videoCard.addEventListener('click', togglePlay);

        // Progress bar update
        video.addEventListener('timeupdate', () => {
            if (video.duration) {
                const pct = (video.currentTime / video.duration) * 100;
                progressBar.style.width = pct + '%';
            }
        });

        // Autoplay when card scrolls into view
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().then(() => {
                        playBtn.classList.add('playing');
                    }).catch(() => { });
                    videoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        videoObserver.observe(videoCard);
    }
});
