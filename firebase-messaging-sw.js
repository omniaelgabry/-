// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
