/* ============================================
   Firebase Configuration — Compat SDK
   ============================================
   Uses the compat (namespaced) SDK loaded via
   CDN <script> tags in each HTML page.
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCIEn5aMyyyAaO3KUPpyHWHxOdF8pvpJsA",
    authDomain: "cga-firestore.firebaseapp.com",
    projectId: "cga-firestore",
    storageBucket: "cga-firestore.firebasestorage.app",
    messagingSenderId: "297504505033",
    appId: "1:297504505033:web:eecc4bcccf621bff55a118"
};

// Initialize Firebase (compat global)
firebase.initializeApp(firebaseConfig);

// Expose services globally — used by auth.js, auth-guard.js, dashboard.js, etc.
const auth = firebase.auth();
const db = firebase.firestore();

// Keep user logged in across browser sessions
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
