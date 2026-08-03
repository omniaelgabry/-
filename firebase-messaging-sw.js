importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCfQo-1AJ73HbZHdQPiJxqxKNO6VpVv-9o",
  authDomain: "quraan-dce7d.firebaseapp.com",
  projectId: "quraan-dce7d",
  storageBucket: "quraan-dce7d.firebasestorage.app",
  messagingSenderId: "1078911623599",
  appId: "1:1078911623599:web:2c8d1302324ce70ca44f5a",
  measurementId: "G-X1MY03X2S0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title || '✨️الرفيق اليومي✨️';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
