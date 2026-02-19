/* ============================================
   CGA Courses Page — Interaction Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Trading Flux Playground (Canvas) ---
    const canvas = document.getElementById('flux-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;

    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.color = Math.random() > 0.5 ? '#FFB800' : '#444444';
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 15;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 15;
                }
            }
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].draw();
            particles[i].update();
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.strokeStyle = `rgba(255, 184, 0, ${1 - (distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    // --- Course Switching Logic ---
    const sectorNodes = document.querySelectorAll('.sector-node');
    const courseTracks = document.querySelectorAll('.course-track');

    sectorNodes.forEach(node => {
        node.addEventListener('click', () => {
            const courseId = node.getAttribute('data-course');

            // Update active node
            sectorNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            // Switch content
            courseTracks.forEach(track => {
                track.classList.remove('visible');
                if (track.id === `course-${courseId}`) {
                    setTimeout(() => {
                        track.classList.add('visible');
                    }, 100);
                }
            });

            // Smooth scroll to details if on mobile
            if (window.innerWidth < 768) {
                document.getElementById('course-details').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Set default active
    document.querySelector('[data-course="epp"]').classList.add('active');

});
