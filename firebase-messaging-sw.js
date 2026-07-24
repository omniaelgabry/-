importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCfQo-1AJ73HbZhDqPiJxqkN06VpVv-9o",
  authDomain: "quraan-dce7d.firebaseapp.com",
  projectId: "quraan-dce7d",
  storageBucket: "quraan-dce7d.firebasestorage.app",
  messagingSenderId: "1078911623599",
  appId: "1:1078911623599:web:2c8d1302324ce70ca44f5a"
});

const messaging = firebase.messaging();
