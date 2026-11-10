import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl_aqFWG1zoN6LwoSqxH2ngCImL0fcbdU",
  authDomain: "memwrap-d18ea.firebaseapp.com",
  projectId: "memwrap-d18ea",
  storageBucket: "memwrap-d18ea.firebasestorage.app",
  messagingSenderId: "336832514298",
  appId: "1:336832514298:web:f02d6f762c00c901b62143",
};

// Initialize Firebase
export const firebase_app = initializeApp(firebaseConfig);

// Get the Firestore database object
export const db = getFirestore(firebase_app);
export const firebase_auth = getAuth(firebase_app);
