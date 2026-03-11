/* ============================================
   Profile — Account Details & Enrollment History
   ============================================ */

window.addEventListener('cga:auth-ready', async (e) => {
    const user = e.detail;
    const firebaseUser = auth.currentUser;

    // Set user info in nav
    const displayName = user.displayName || firebaseUser.email.split('@')[0];
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-name').textContent = displayName;

    // Populate profile fields
    document.getElementById('profile-name').value = user.displayName || '—';
    document.getElementById('profile-email').value = user.email || firebaseUser.email;
    document.getElementById('profile-role').value = (user.role || 'student').charAt(0).toUpperCase() + (user.role || 'student').slice(1);
    document.getElementById('profile-since').value = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : '—';

    // Load enrollment history
    loadEnrollmentHistory(user.uid);

    // Password change
    setupPasswordChange();
});

async function loadEnrollmentHistory(uid) {
    const container = document.getElementById('enrollment-history');

    try {
        const snap = await db.collection('enrollments')
            .where('userId', '==', uid)
            .get();

        if (snap.empty) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No enrollments yet. Contact CGA to enroll in a course.</p>';
            return;
        }

        const now = new Date();
        const rows = snap.docs.map(doc => {
            const d = doc.data();
            const start = d.startDate ? d.startDate.toDate().toLocaleDateString() : '—';
            const end = d.endDate ? d.endDate.toDate().toLocaleDateString() : '—';
            const isActive = d.endDate && d.endDate.toDate() > now && d.status !== 'suspended';
            const pct = d.percentComplete || 0;

            return `
                <tr>
                    <td style="color: var(--accent-lime); font-family: var(--font-mono);">${d.courseId.toUpperCase()}</td>
                    <td>${start}</td>
                    <td>${end}</td>
                    <td><span class="${isActive ? 'status-active' : 'status-expired'}">${isActive ? 'Active' : 'Expired'}</span></td>
                    <td>${pct}%</td>
                    <td>${d.completedLessons || 0} / ${d.totalLessons || 0}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Lessons</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

    } catch (err) {
        console.error('Enrollment history error:', err);
        container.innerHTML = '<p style="color: #ff4444; font-size: 13px;">Failed to load enrollment history.</p>';
    }
}

function setupPasswordChange() {
    const form = document.getElementById('password-form');
    const messageEl = document.getElementById('password-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.className = 'admin-message';
        messageEl.style.display = 'none';

        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-new-password').value;

        if (newPass !== confirmPass) {
            messageEl.className = 'admin-message error';
            messageEl.textContent = 'Passwords do not match.';
            messageEl.style.display = 'block';
            return;
        }

        if (newPass.length < 6) {
            messageEl.className = 'admin-message error';
            messageEl.textContent = 'Password must be at least 6 characters.';
            messageEl.style.display = 'block';
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'UPDATING...';

        try {
            await auth.currentUser.updatePassword(newPass);
            messageEl.className = 'admin-message success';
            messageEl.textContent = 'Password updated successfully.';
            messageEl.style.display = 'block';
            form.reset();
        } catch (err) {
            if (err.code === 'auth/requires-recent-login') {
                messageEl.className = 'admin-message error';
                messageEl.textContent = 'Please sign out and sign back in before changing your password.';
            } else {
                messageEl.className = 'admin-message error';
                messageEl.textContent = err.message;
            }
            messageEl.style.display = 'block';
        }

        submitBtn.disabled = false;
        submitBtn.textContent = 'UPDATE PASSWORD';
    });
}
