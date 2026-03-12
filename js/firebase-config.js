/* ============================================
   Firebase Configuration — Compat SDK
   ============================================
   Uses the compat (namespaced) SDK loaded via
   CDN <script> tags in each HTML page.
   ============================================ */

const firebaseConfig = {
    apiKey: import.meta.env.CGA_FIREBASE_API_KEY,
    authDomain: import.meta.env.CGA_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.CGA_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.CGA_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.CGA_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.CGA_FIREBASE_APP_ID,
    measurementId: import.meta.env.CGA_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (compat global)
firebase.initializeApp(firebaseConfig);

// Expose services globally — used by auth.js, auth-guard.js, dashboard.js, etc.
const auth = firebase.auth();
const db = firebase.firestore();

// Keep user logged in across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
