// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkSzDG2TM4UBlntc-Zab64jilDfvP56EU",
  authDomain: "hospital--app.firebaseapp.com",
  projectId: "hospital--app",
  storageBucket: "hospital--app.firebasestorage.app",
  messagingSenderId: "19591225654",
  appId: "1:19591225654:web:ddc2560c15c3583d9dd397",
  measurementId: "G-Q9HSPQF3HG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);