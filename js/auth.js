/* ============================================
   Auth — Login / Signup / Logout
   ============================================ */

// --- Signup ---
function initSignup() {
    const form = document.getElementById('signup-form');
    const errorEl = document.getElementById('auth-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'CREATING ACCOUNT...';

        const name = form.querySelector('#signup-name').value.trim();
        const email = form.querySelector('#signup-email').value.trim();
        const password = form.querySelector('#signup-password').value;
        const confirmPassword = form.querySelector('#signup-confirm').value;

        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'CREATE ACCOUNT';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'CREATE ACCOUNT';
            return;
        }

        try {
            // Prevent onAuthStateChanged from redirecting before Firestore write completes
            window._isSigningUp = true;

            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });

            // Create Firestore user doc
            await db.collection('users').doc(cred.user.uid).set({
                uid: cred.user.uid,
                email: email,
                displayName: name,
                role: 'student',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            window.location.href = 'dashboard.html';
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password is too weak. Use at least 6 characters.'
            };
            errorEl.textContent = messages[err.code] || err.message;
            submitBtn.disabled = false;
            submitBtn.textContent = 'CREATE ACCOUNT';
        }
    });
}

// --- Login ---
function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('auth-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'SIGNING IN...';

        const email = form.querySelector('#login-email').value.trim();
        const password = form.querySelector('#login-password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            window.location.href = 'dashboard.html';
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many failed attempts. Try again later.',
                'auth/invalid-credential': 'Invalid email or password.'
            };
            errorEl.textContent = messages[err.code] || err.message;
            submitBtn.disabled = false;
            submitBtn.textContent = 'SIGN IN';
        }
    });
}

// --- Logout ---
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// --- Password Reset ---
function initPasswordReset() {
    const link = document.getElementById('forgot-password');
    if (!link) return;

    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const email = emailInput ? emailInput.value.trim() : '';
        const errorEl = document.getElementById('auth-error');

        if (!email) {
            errorEl.textContent = 'Enter your email above, then click "Forgot password."';
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            errorEl.style.color = 'var(--accent-lime)';
            errorEl.textContent = 'Password reset email sent. Check your inbox.';
        } catch (err) {
            errorEl.textContent = 'Could not send reset email. Check the email address.';
        }
    });
}
