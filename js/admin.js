/* ============================================
   Admin Panel — Enrollment Management
   ============================================ */

window.addEventListener('cga:auth-ready', async (e) => {
    const user = e.detail;

    // Set user info
    const displayName = user.displayName || user.email.split('@')[0];
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent = displayName;

    // Load data
    loadEnrollments();
    loadStudents();
    setupEnrollForm();
});

// --- Activate Enrollment ---
function setupEnrollForm() {
    const form = document.getElementById('enroll-form');
    const messageEl = document.getElementById('enroll-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.className = 'admin-message';
        messageEl.style.display = 'none';

        const email = document.getElementById('enroll-email').value.trim();
        const courseId = document.getElementById('enroll-course').value;
        const days = parseInt(document.getElementById('enroll-days').value, 10);

        if (!email || !courseId || !days) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'ACTIVATING...';

        try {
            // Find user by email
            const usersSnap = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (usersSnap.empty) {
                showMessage(messageEl, 'error', `No student found with email: ${email}. They must sign up first.`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'ACTIVATE ENROLLMENT';
                return;
            }

            const studentDoc = usersSnap.docs[0];
            const studentData = studentDoc.data();

            // Check for existing active enrollment
            const existingSnap = await db.collection('enrollments')
                .where('userId', '==', studentData.uid)
                .where('courseId', '==', courseId)
                .where('status', '==', 'active')
                .limit(1)
                .get();

            if (!existingSnap.empty) {
                showMessage(messageEl, 'error', `Student already has an active ${courseId.toUpperCase()} enrollment.`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'ACTIVATE ENROLLMENT';
                return;
            }

            // Get course info for total lessons count
            const courseDoc = await db.collection('courses').doc(courseId).get();
            let totalLessons = 0;
            if (courseDoc.exists) {
                const courseData = courseDoc.data();
                (courseData.modules || []).forEach(m => {
                    totalLessons += (m.lessons || []).length;
                });
            }

            // Create enrollment
            const now = new Date();
            const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

            await db.collection('enrollments').add({
                userId: studentData.uid,
                courseId: courseId,
                startDate: firebase.firestore.Timestamp.fromDate(now),
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                status: 'active',
                progress: {},
                completedLessons: 0,
                totalLessons: totalLessons,
                percentComplete: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showMessage(messageEl, 'success',
                `Enrolled ${studentData.displayName || email} in ${courseId.toUpperCase()} for ${days} days.`);

            form.reset();
            document.getElementById('enroll-days').value = '60';
            loadEnrollments();

        } catch (err) {
            console.error('Enrollment error:', err);
            showMessage(messageEl, 'error', 'Failed to create enrollment. Check console for details.');
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'ACTIVATE ENROLLMENT';
    });
}

function showMessage(el, type, text) {
    el.className = `admin-message ${type}`;
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 6000);
}

// --- Load Recent Enrollments ---
async function loadEnrollments() {
    const container = document.getElementById('enrollments-list');

    try {
        const snap = await db.collection('enrollments')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        if (snap.empty) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No enrollments yet.</p>';
            return;
        }

        // Fetch user names
        const userIds = [...new Set(snap.docs.map(d => d.data().userId))];
        const userMap = {};
        for (const uid of userIds) {
            const uDoc = await db.collection('users').doc(uid).get();
            if (uDoc.exists) userMap[uid] = uDoc.data();
        }

        const rows = snap.docs.map(doc => {
            const d = doc.data();
            const u = userMap[d.userId] || {};
            const start = d.startDate ? d.startDate.toDate().toLocaleDateString() : '—';
            const end = d.endDate ? d.endDate.toDate().toLocaleDateString() : '—';
            const now = new Date();
            const isActive = d.endDate && d.endDate.toDate() > now && d.status !== 'suspended';

            return `
                <tr>
                    <td>${u.displayName || u.email || d.userId}</td>
                    <td style="color: var(--accent-lime); font-family: var(--font-mono);">${d.courseId.toUpperCase()}</td>
                    <td>${start}</td>
                    <td>${end}</td>
                    <td><span class="${isActive ? 'status-active' : 'status-expired'}">${isActive ? 'Active' : 'Expired'}</span></td>
                    <td>${d.percentComplete || 0}%</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

    } catch (err) {
        console.error('Load enrollments error:', err);
        container.innerHTML = '<p style="color: #ff4444; font-size: 13px;">Failed to load enrollments.</p>';
    }
}

// --- Load Students ---
async function loadStudents() {
    const container = document.getElementById('students-list');

    try {
        const snap = await db.collection('users')
            .where('role', '==', 'student')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        if (snap.empty) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No students registered yet.</p>';
            return;
        }

        const rows = snap.docs.map(doc => {
            const d = doc.data();
            const created = d.createdAt ? d.createdAt.toDate().toLocaleDateString() : '—';
            return `
                <tr>
                    <td>${d.displayName || '—'}</td>
                    <td>${d.email}</td>
                    <td>${created}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Registered</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

    } catch (err) {
        console.error('Load students error:', err);
        container.innerHTML = '<p style="color: #ff4444; font-size: 13px;">Failed to load students.</p>';
    }
}
