const express = require('express');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// محاكاة وقت الصلاة وإرسال إشعار (Push Notification)
// في التطبيق الحقيقي بنربط ده بـ Web Push API أو Firebase
function sendPrayerNotification(prayerName) {
    console.log(`[إشعار مرسل] حانت الآن صلاة ${prayerName}! تقبل الله طاعتكم.`);
    // هنا بيتم إرسال الإشعار فعلياً لجهاز المستخدم في الخلفية
}

// جدولة وهمية لاختبار وقت الأذان (مثلاً كل صلاة حسب توقيتها)
// باستخدام مكتبة node-cron لجدولة المهام في الخلفية
cron.schedule('0 4 * * *', () => sendPrayerNotification('الفجر'));
cron.schedule('0 12 * * *', () => sendPrayerNotification('الظهر'));
cron.schedule('0 15 * * *', () => sendPrayerNotification('العصر'));
cron.schedule('0 18 * * *', () => sendPrayerNotification('المغرب'));
cron.schedule('0 20 * * *', () => sendPrayerNotification('العشاء'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل الآن على البورت ${PORT} وجاهز لإرسال إشعارات الصلوات.`);
});