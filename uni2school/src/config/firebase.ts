import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAR3UB8VaQmmm0mmmdxXyIO4d6jCynmTVo",
  authDomain: "rp-vi-3fb68.firebaseapp.com",
  projectId: "rp-vi-3fb68",
  storageBucket: "rp-vi-3fb68.firebasestorage.app",
  messagingSenderId: "570855454241",
  appId: "1:570855454241:web:f176a382d2a3f890bed560"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
