// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfQo-1AJ73HbZHdQPiJxqxKNO6VpVv-9o",
  authDomain: "quraan-dce7d.firebaseapp.com",
  projectId: "quraan-dce7d",
  storageBucket: "quraan-dce7d.firebasestorage.app",
  messagingSenderId: "1078911623599",
  appId: "1:1078911623599:web:2c8d1302324ce70ca44f5a",
  measurementId: "G-X1MY03X2S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, db, messaging, getToken, onMessage, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc };
