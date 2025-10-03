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
  apiKey: "AIzaSyCzcrdaiQpTopVwbPHl-rIE9xnA3DYVudg",
  authDomain: "doctorpatient-fd603.firebaseapp.com",
  projectId: "doctorpatient-fd603",
  storageBucket: "doctorpatient-fd603.firebasestorage.app",
  messagingSenderId: "807275297949",
  appId: "1:807275297949:web:ac5442d0757cdc86ffe874",
  measurementId: "G-L4643ZTDYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

