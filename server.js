const express = require('express');
const cron = require('node-cron');
const cors = require('cors');
const webpush = require('web-push');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

let vapidKeys;
if (fs.existsSync('vapidKeys.json')) {
    vapidKeys = JSON.parse(fs.readFileSync('vapidKeys.json'));
} else {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync('vapidKeys.json', JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
  'mailto:test@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];
if (fs.existsSync('subscriptions.json')) {
    subscriptions = JSON.parse(fs.readFileSync('subscriptions.json'));
}

app.get('/api/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscriptions.find(sub => sub.endpoint === subscription.endpoint)) {
      subscriptions.push(subscription);
      fs.writeFileSync('subscriptions.json', JSON.stringify(subscriptions));
  }
  res.status(201).json({});
});

// محاكاة وقت الصلاة وإرسال إشعار (Push Notification)
function sendPrayerNotification(prayerName) {
    console.log(`[إشعار مرسل] حانت الآن صلاة ${prayerName}! تقبل الله طاعتكم.`);
    
    const payload = JSON.stringify({
        title: '✨️الرفيق اليومي✨️',
        body: `حانت الآن صلاة ${prayerName}! تقبل الله طاعتكم.`,
    });

    subscriptions.forEach((subscription, index) => {
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error('Error sending notification, removing subscription', error);
            subscriptions.splice(index, 1);
            fs.writeFileSync('subscriptions.json', JSON.stringify(subscriptions));
        });
    });
}

// جدولة الصلاة
cron.schedule('0 4 * * *', () => sendPrayerNotification('الفجر'));
cron.schedule('0 12 * * *', () => sendPrayerNotification('الظهر'));
cron.schedule('0 15 * * *', () => sendPrayerNotification('العصر'));
cron.schedule('0 18 * * *', () => sendPrayerNotification('المغرب'));
cron.schedule('0 20 * * *', () => sendPrayerNotification('العشاء'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على البورت ${PORT} وجاهز لإرسال إشعارات الصلوات.`);
});