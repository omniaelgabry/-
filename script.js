document.addEventListener("DOMContentLoaded", () => {
    initPrayerTimes();
    initPrayerTracker();
    initMisbaha();
    initQuranSection();
    initNotificationsButton();
});

// تفعيل إشعارات المتصفح
async function initNotificationsButton() {
    const notifyBtn = document.getElementById("notify-permission-btn");
    notifyBtn.addEventListener("click", async () => {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
            alert("متصفحك لا يدعم الإشعارات");
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            try {
                const register = await navigator.serviceWorker.register('/sw.js');
                const response = await fetch('http://localhost:3000/api/vapidPublicKey');
                const vapidPublicKey = await response.text();
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });

                await fetch('http://localhost:3000/api/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: { 'content-type': 'application/json' }
                });

                alert("تم تفعيل إشعارات الصلاة بنجاح! 🔔");
                new Notification("✨️الرفيق اليومي✨️", { body: "تم الربط مع الخادم بنجاح!" });
            } catch (error) {
                console.error("Error setting up push notifications:", error);
                alert("حدث خطأ أثناء تفعيل الإشعارات من السيرفر.");
            }
        } else {
            alert("تم رفض إذن الإشعارات.");
        }
    });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

    if (!surahSelect) return; // In case we are not on index.html

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
            // التوجيه إلى الصفحة الجديدة
            window.location.href = `surah.html?id=${num}`;
        });
    }
}
