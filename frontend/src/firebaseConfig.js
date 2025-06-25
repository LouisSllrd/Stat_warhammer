// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBXAGxFm5Jl0oWY2lc8-3auAHpaGSoLk2s",
    authDomain: "stat-warhammer.firebaseapp.com",
    projectId: "stat-warhammer",
    storageBucket: "stat-warhammer.firebasestorage.app",
    messagingSenderId: "1087382725374",
    appId: "1:1087382725374:web:4fc68ed3d6056a11e53baf",
    measurementId: "G-Q80NT7NXTJ"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
