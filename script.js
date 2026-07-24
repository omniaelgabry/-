document.addEventListener("DOMContentLoaded", () => {
    initPrayerTimes();
    initPrayerTracker();
    initMisbaha();
    initQuranSection();
    initNotificationsButton();
});

// مواقيت الصلاة
async function initPrayerTimes() {
    const nextPrayerBox = document.getElementById("next-prayer-box");
    try {
        const response = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5");
        const data = await response.json();
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        nextPrayerBox.innerHTML = `مواقيت اليوم نشطة | الوقت الحالي: ${currentTime}`;
    } catch (error) {
        nextPrayerBox.innerHTML = "تعذر تحميل مواقيت الصلاة حالياً";
    }
}

// متتبع الصلوات مع تصفير يومي تلقائي
function initPrayerTracker() {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem("prayer_date");
    let prayerStatus = JSON.parse(localStorage.getItem("prayer_status")) || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };

    if (savedDate !== todayStr) {
        prayerStatus = { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
        localStorage.setItem("prayer_date", todayStr);
        localStorage.setItem("prayer_status", JSON.stringify(prayerStatus));
    }

    document.querySelectorAll(".pray-btn").forEach(btn => {
        const key = btn.getAttribute("data-prayer");
        if (prayerStatus[key]) { btn.classList.add("completed"); btn.textContent = "تمت الصلاة ✓"; }

        btn.addEventListener("click", () => {
            prayerStatus[key] = !prayerStatus[key];
            btn.classList.toggle("completed", prayerStatus[key]);
            btn.textContent = prayerStatus[key] ? "تمت الصلاة ✓" : "لم تُصلى";
            localStorage.setItem("prayer_status", JSON.stringify(prayerStatus));
        });
    });
}

// السبحة الإلكترونية
function initMisbaha() {
    let count = parseInt(localStorage.getItem("misbaha_count")) || 0;
    const display = document.getElementById("counter-display");
    display.textContent = count;

    document.getElementById("count-btn").addEventListener("click", () => {
        count++; display.textContent = count;
        localStorage.setItem("misbaha_count", count);
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
        count = 0; display.textContent = count;
        localStorage.setItem("misbaha_count", count);
    });
}

// القرآن الكريم
async function initQuranSection() {
    const surahSelect = document.getElementById("surah-select");
    const loadBtn = document.getElementById("load-surah-btn");
    const bookmarkInfo = document.getElementById("bookmark-info");

    if (!surahSelect) return;

    try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        data.data.forEach(surah => {
            const opt = document.createElement("option");
            opt.value = surah.number;
            opt.textContent = `${surah.number}. سورة ${surah.name} (${surah.englishName}) - عدد الآيات: ${surah.numberOfAyahs}`;
            surahSelect.appendChild(opt);
        });
    } catch (e) {
        surahSelect.innerHTML = `<option>فشل تحميل قائمة السور</option>`;
    }

    const savedBookmark = JSON.parse(localStorage.getItem("quran_bookmark"));
    if (savedBookmark && bookmarkInfo) {
        bookmarkInfo.textContent = `📌 آخر آية حفظتها: سورة ${savedBookmark.surah} - آية رقم ${savedBookmark.ayah}`;
    }

    if (loadBtn) {
        loadBtn.addEventListener("click", () => {
            const num = surahSelect.value;
            if (!num) {
                alert("الرجاء اختيار سورة أولاً");
                return;
            }
            window.location.href = `surah.html?id=${num}`;
        });
    }
}

// إعدادات الفايربيز وتفعيل الإشعارات بالزر الذهبي
const firebaseConfig = {
  apiKey: "AIzaSyCfQo-1AJ73HbZhDqPiJxqkN06VpVv-9o",
  authDomain: "quraan-dce7d.firebaseapp.com",
  projectId: "quraan-dce7d",
  storageBucket: "quraan-dce7d.firebasestorage.app",
  messagingSenderId: "1078911623599",
  appId: "1:1078911623599:web:2c8d1302324ce70ca44f5a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

function initNotificationsButton() {
    const notifyBtn = document.querySelector('.gold-btn');
    if (!notifyBtn) return;

    notifyBtn.addEventListener('click', () => {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                messaging.getToken({ 
                    vapidKey: 'BAQ03NdH_kjTxMBPSx4FWuNrEuXgHj0dkh6O7qs0m5Ik3YwPiz25akdvULP4JyP7LfHKkQ_liIgIMDalJmWoF4c' 
                }).then((currentToken) => {
                    if (currentToken) {
                        alert('تم تفعيل إشعارات الصلوات بنجاح! 🔔');
                        console.log('Token:', currentToken);
                    } else {
                        alert('لم يتم العثور على توكن الإشعارات.');
                    }
                }).catch((err) => {
                    console.error('Error getting token:', err);
                    alert('حدث خطأ أثناء جلب التوكن.');
                });
            } else {
                alert('تم رفض إذن الإشعارات.');
            }
        });
    });
}


// تفعيل الزرار عند الضغط عليه
document.querySelector('.gold-btn').addEventListener('click', () => {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      messaging.getToken({ 
        vapidKey: 'BAQ03NdH_kjTxMBPS4FWuNrEuXgHj0dkh6O7qs0m5Ik3YwPiz25akdvULP4JyP7LfHKkQ_liIgIMDalJmWoF4c' 
      }).then((currentToken) => {
        if (currentToken) {
          alert('تم تفعيل إشعارات الصلوات بنجاح! 🔔');
          console.log('Token:', currentToken);
        } else {
          console.log('No registration token available.');
          alert('لم يتم العثور على توكن الإشعارات.');
        }
      }).catch((err) => {
        // السطر ده هيخلي الخطأ الحقيقي يظهر فوراً في الـ Console عندك
        console.error('An error occurred while retrieving token: ', err);
        alert('خطأ في جلب التوكن: ' + err.message);
      });

    } else {
      alert('تم رفض إذن الإشعارات.');
    }
  });
});
