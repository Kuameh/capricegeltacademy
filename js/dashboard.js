/* ============================================
   Dashboard — Student Home
   ============================================ */

window.addEventListener('cga:auth-ready', async (e) => {
    const user = e.detail;

    // Set user info in nav
    const avatar = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const welcomeEl = document.getElementById('welcome-heading');

    const displayName = user.displayName || user.email.split('@')[0];
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    avatar.textContent = initials;
    nameEl.textContent = displayName;
    welcomeEl.textContent = `Welcome back, ${displayName.split(' ')[0]}`;

    // Fetch enrollments
    try {
        const enrollSnap = await db.collection('enrollments')
            .where('userId', '==', user.uid)
            .get();

        if (enrollSnap.empty) {
            showPendingState();
            return;
        }

        const enrollments = [];
        enrollSnap.forEach(doc => enrollments.push({ id: doc.id, ...doc.data() }));

        // Fetch course data for each enrollment
        const courseIds = [...new Set(enrollments.map(e => e.courseId))];
        const courseDocs = {};
        for (const cid of courseIds) {
            const cDoc = await db.collection('courses').doc(cid).get();
            if (cDoc.exists) courseDocs[cid] = cDoc.data();
        }

        renderStats(enrollments);
        renderCourses(enrollments, courseDocs);

    } catch (err) {
        console.error('Dashboard load error:', err);
        document.getElementById('courses-container').innerHTML =
            '<div class="pending-state"><p>Could not load courses. Please refresh.</p></div>';
    }
});

function showPendingState() {
    document.getElementById('dash-stats').style.display = 'none';
    document.getElementById('courses-title').textContent = '';

    document.getElementById('courses-container').innerHTML = `
        <div class="pending-state">
            <div class="pending-icon">⏳</div>
            <h2>Awaiting Course Activation</h2>
            <p>Your account is ready! To access courses, complete your enrollment by contacting CGA via WhatsApp.</p>
            <div class="pending-steps">
                <div class="pending-step">
                    <div class="step-num">01</div>
                    <p>Contact CGA via WhatsApp</p>
                </div>
                <div class="pending-step">
                    <div class="step-num">02</div>
                    <p>Complete payment</p>
                </div>
                <div class="pending-step">
                    <div class="step-num">03</div>
                    <p>Admin activates access</p>
                </div>
            </div>
            <a href="https://wa.me/233598933808?text=Hi%20CGA%2C%20I%20created%20my%20account%20and%20want%20to%20enroll%20in%20a%20course." target="_blank" class="btn-primary" style="display: inline-flex; justify-content: center;">
                Enroll via WhatsApp
                <div class="btn-arrow">➜</div>
            </a>
        </div>
    `;
}

function renderStats(enrollments) {
    const now = new Date();
    let totalLessons = 0;
    let activeCount = 0;

    enrollments.forEach(e => {
        totalLessons += e.completedLessons || 0;
        const endDate = e.endDate ? e.endDate.toDate() : null;
        if (endDate && endDate > now && e.status !== 'suspended') activeCount++;
    });

    document.getElementById('stat-courses').textContent = enrollments.length;
    document.getElementById('stat-lessons').textContent = totalLessons;
    document.getElementById('stat-active').textContent = activeCount;
}

function renderCourses(enrollments, courseDocs) {
    const container = document.getElementById('courses-container');
    const now = new Date();

    const html = enrollments.map(enrollment => {
        const course = courseDocs[enrollment.courseId] || {};
        const courseName = course.name || enrollment.courseId.toUpperCase();
        const shortName = course.shortName || enrollment.courseId.toUpperCase();

        const endDate = enrollment.endDate ? enrollment.endDate.toDate() : null;
        const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : 0;
        const isExpired = daysLeft <= 0;
        const isActive = !isExpired && enrollment.status !== 'suspended';

        const pct = enrollment.percentComplete || 0;
        const completed = enrollment.completedLessons || 0;
        const total = enrollment.totalLessons || 0;

        // SVG progress ring
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (pct / 100) * circumference;

        return `
            <div class="course-card">
                <div class="course-card-header">
                    <div class="course-card-title">${courseName}</div>
                    <span class="course-card-tier">${shortName}</span>
                </div>

                <div class="progress-container">
                    <div class="progress-ring-wrapper">
                        <svg class="progress-ring" width="56" height="56">
                            <circle class="progress-ring-bg" cx="28" cy="28" r="${radius}"></circle>
                            <circle class="progress-ring-fill" cx="28" cy="28" r="${radius}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"></circle>
                        </svg>
                        <span class="progress-pct">${Math.round(pct)}%</span>
                    </div>
                    <div class="progress-details">
                        <span class="label-technical">Progress</span>
                        <span>${completed} / ${total} lessons</span>
                    </div>
                </div>

                <div class="days-remaining ${isExpired ? 'days-expired' : ''}">
                    <div>
                        <div class="value-mono">${isExpired ? '0' : daysLeft}</div>
                        <span class="label-technical">${isExpired ? 'Days — Expired' : 'Days remaining'}</span>
                    </div>
                    <span class="${isActive ? 'status-active' : 'status-expired'}">${isActive ? 'Active' : 'Expired'}</span>
                </div>

                ${isActive
                ? `<a href="course-viewer.html?courseId=${enrollment.courseId}&enrollmentId=${enrollment.id}" class="btn-continue">
                        Continue Learning <span>➜</span>
                    </a>`
                : `<a href="https://wa.me/233598933808?text=Hi%20CGA%2C%20my%20${shortName}%20access%20expired.%20I%20want%20to%20re-enroll." target="_blank" class="btn-continue disabled" style="pointer-events:auto; background: var(--border-dim); color: var(--text-tertiary);">
                        Re-enroll via WhatsApp
                    </a>`
            }
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="courses-grid">${html}</div>`;
}
