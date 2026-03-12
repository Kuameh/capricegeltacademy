/* ============================================
   Auth Guard — Route Protection
   ============================================
   Include on every protected page (dashboard,
   course-viewer, profile, admin). Redirects to
   login.html if unauthenticated.
   ============================================ */

(function () {
    const loadingEl = document.getElementById('auth-loading');
    const contentEl = document.getElementById('dashboard-content');

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // Fetch user profile from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (!userDoc.exists) {
                // First-time sign-in — create user profile
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    role: 'student',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                window.CGA_USER = { uid: user.uid, email: user.email, displayName: user.displayName || '', role: 'student' };
            } else {
                window.CGA_USER = userDoc.data();
            }

            // Admin page guard
            const isAdminPage = document.body.dataset.requireAdmin === 'true';
            if (isAdminPage && window.CGA_USER.role !== 'admin') {
                window.location.href = 'dashboard.html';
                return;
            }

            // Show content, hide loading
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';

            // Dispatch ready event for page-specific JS
            window.dispatchEvent(new CustomEvent('cga:auth-ready', { detail: window.CGA_USER }));

        } catch (err) {
            console.error('Auth guard error:', err);
            if (loadingEl) loadingEl.innerHTML = '<p style="color: #ff4444;">Something went wrong. Please refresh.</p>';
        }
    });
})();
