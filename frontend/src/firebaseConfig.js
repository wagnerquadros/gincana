// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR3UB8VaQmmm0mmmdxXyIO4d6jCynmTVo",
  authDomain: "rp-vi-3fb68.firebaseapp.com",
  projectId: "rp-vi-3fb68",
  storageBucket: "rp-vi-3fb68.firebasestorage.app",
  messagingSenderId: "570855454241",
  appId: "1:570855454241:web:f176a382d2a3f890bed560"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;