/**
 * courses.js
 * Handles the "Chaos to Clarity" Interactive Canvas Playground
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('chaosCanvas');
    if (!canvas) return; // Only run on courses page

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-wrapper');
    const scannerRing = document.getElementById('scanner-ring');
    const instruction = document.querySelector('.playground-instruction');

    // Setup Canvas Resolution
    let width, height;
    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    window.addEventListener('resize', resize);
    resize();

    // Interaction State
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, isActive: false };
    const LENS_RADIUS = 150;

    // Track Mouse/Touch
    function updateMousePos(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = clientX - rect.left;
        mouse.targetY = clientY - rect.top;
        if (!mouse.isActive) {
            mouse.isActive = true;
            scannerRing.style.opacity = '1';
            instruction.style.opacity = '0';
        }
    }

    canvas.addEventListener('mousemove', (e) => updateMousePos(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', (e) => {
        // Prevent scrolling while interacting with canvas
        if (e.cancelable) e.preventDefault();
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('mouseleave', () => {
        mouse.isActive = false;
        scannerRing.style.opacity = '0';
        instruction.style.opacity = '1';
    });

    // --- Background "Chaos" Data ---
    const chaosCandles = [];
    for (let i = 0; i < 200; i++) {
        chaosCandles.push({
            x: Math.random() * 2000,
            y: Math.random() * 1000,
            w: 4 + Math.random() * 12,
            h: 10 + Math.random() * 100,
            wick: 20 + Math.random() * 150,
            speedX: -0.5 - Math.random() * 1.5,
            color: Math.random() > 0.5 ? 'rgba(255, 60, 60, 0.4)' : 'rgba(50, 255, 100, 0.4)' // Red or Green noise
        });
    }

    // --- Foreground "Clarity" Data (Gold Trend) ---
    const trendPoints = [];
    const segments = 50;
    const ptsSpacing = 2000 / segments;
    let baseTrendY = 400;
    for (let i = 0; i < segments; i++) {
        // Create a general upwards structural trend
        baseTrendY -= (Math.random() * 10) + 5;
        trendPoints.push({
            x: i * ptsSpacing,
            y: baseTrendY + (Math.sin(i * 0.5) * 40) // Add some wave
        });
    }

    let time = 0;

    // Animation Loop
    function animate() {
        time += 0.05;

        // Smooth mouse interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;

        // Update scanner ring position (DOM element)
        if (mouse.isActive) {
            scannerRing.style.left = mouse.x + 'px';
            scannerRing.style.top = mouse.y + 'px';
            scannerRing.style.width = (LENS_RADIUS * 2) + 'px';
            scannerRing.style.height = (LENS_RADIUS * 2) + 'px';
        }

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Background Chaos
        ctx.save();
        chaosCandles.forEach(c => {
            // Move chaos
            c.x += c.speedX;
            if (c.x < -50) c.x = width + 50;

            // Wobble
            let wobbleY = c.y + Math.sin(time + c.x) * 10;

            // Draw wick
            ctx.beginPath();
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 1;
            ctx.moveTo(c.x + c.w / 2, wobbleY - c.wick / 2);
            ctx.lineTo(c.x + c.w / 2, wobbleY + c.wick / 2);
            ctx.stroke();

            // Draw body
            ctx.fillStyle = c.color;
            ctx.fillRect(c.x, wobbleY - c.h / 2, c.w, c.h);
        });

        // Add static noise grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
        for (let i = 0; i < height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
        ctx.stroke();

        ctx.restore();

        // 2. Draw Clarity Lens
        if (mouse.isActive) {
            ctx.save();

            // Create Clipping Path (The Spotlight)
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, LENS_RADIUS, 0, Math.PI * 2);
            ctx.clip();

            // Fill clear background inside lens
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, width, height);

            // Draw clean grid inside lens
            ctx.strokeStyle = 'rgba(255, 184, 0, 0.1)';
            ctx.beginPath();
            for (let i = 0; i < width; i += 40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
            for (let i = 0; i < height; i += 40) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
            ctx.stroke();

            // Draw Clean Gold Trendline
            ctx.beginPath();
            ctx.strokeStyle = '#FFB800';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // Shift trendline to simulate movement
            let shiftX = (time * 20) % ptsSpacing;

            ctx.moveTo(trendPoints[0].x - shiftX, trendPoints[0].y + Math.sin(time) * 10);

            for (let i = 1; i < trendPoints.length; i++) {
                let p = trendPoints[i];
                // Add a gentle breathing motion to the trend
                let breathY = Math.sin(time + i * 0.2) * 10;
                ctx.lineTo(p.x - shiftX, p.y + breathY);
            }
            ctx.stroke();

            // Add Glow to Trendline
            ctx.shadowColor = 'rgba(255, 184, 0, 0.6)';
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset

            // Draw "Clear Signals" (Dots on the line)
            for (let i = 2; i < trendPoints.length; i += 5) {
                let p = trendPoints[i];
                let px = p.x - shiftX;
                let py = p.y + Math.sin(time + i * 0.2) * 10;

                // Only draw if within reasonable bounds to save performance
                if (px > -50 && px < width + 50) {
                    // Signal Dot
                    ctx.beginPath();
                    ctx.fillStyle = '#fff';
                    ctx.arc(px, py, 6, 0, Math.PI * 2);
                    ctx.fill();

                    // Signal Ring
                    ctx.beginPath();
                    ctx.strokeStyle = '#FFB800';
                    ctx.lineWidth = 2;
                    ctx.arc(px, py, 12 + Math.sin(time * 3 + i) * 4, 0, Math.PI * 2);
                    ctx.stroke();

                    // Signal Text ("BUY" / "ENTRY")
                    ctx.font = '10px Space Mono';
                    ctx.fillStyle = '#FFB800';
                    ctx.fillText(i % 2 === 0 ? 'BUY SIGNAL' : 'PERFECT ENTRY', px + 15, py - 15);
                }
            }

            // Draw HUD Elements inside Lens
            ctx.font = '12px Space Mono';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText(`CGA ALGORITHM ACTIVE`, mouse.x - LENS_RADIUS + 20, mouse.y - LENS_RADIUS + 30);
            ctx.fillText(`NOISE FILTER: 100%`, mouse.x - LENS_RADIUS + 20, mouse.y - LENS_RADIUS + 50);

            // Crosshairs inside Lens
            ctx.strokeStyle = 'rgba(255, 184, 0, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y - LENS_RADIUS);
            ctx.lineTo(mouse.x, mouse.y + LENS_RADIUS);
            ctx.moveTo(mouse.x - LENS_RADIUS, mouse.y);
            ctx.lineTo(mouse.x + LENS_RADIUS, mouse.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
});
