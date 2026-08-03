document.addEventListener("DOMContentLoaded", () => {
    initPrayerTimes();
    initPrayerTracker();
    initMisbaha();
    initQuranSection();
    initNotificationsButton();
    initTheme();
    initStreak();
});

// تفعيل إشعارات المتصفح
function initNotificationsButton() {
    // The logic has been moved to index.html using Firebase FCM
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
            updatePrayerProgress(prayerStatus);
            if (prayerStatus[key]) updateStreakActivity();
        });
    });

    updatePrayerProgress(prayerStatus);
}

function updatePrayerProgress(status) {
    const total = 5;
    const completed = Object.values(status).filter(Boolean).length;
    const percentage = Math.round((completed / total) * 100);
    
    const fillElem = document.getElementById("prayer-progress-fill");
    const textElem = document.getElementById("prayer-progress-text");
    
    if(fillElem && textElem) {
        fillElem.style.width = percentage + "%";
        textElem.textContent = percentage + "%";
        
        // Change color based on completion
        if (percentage === 100) {
            fillElem.style.backgroundColor = "var(--gold)";
        } else {
            fillElem.style.backgroundColor = "var(--primary-green)";
        }
    }
}

// السبحة الإلكترونية
function initMisbaha() {
    let count = parseInt(localStorage.getItem("misbaha_count")) || 0;
    const display = document.getElementById("counter-display");
    display.textContent = count;

    document.getElementById("count-btn").addEventListener("click", () => {
        count++; display.textContent = count;
        localStorage.setItem("misbaha_count", count);
        updateStreakActivity();
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

// --- Dark Mode Theme Logic ---
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;
    
    const savedTheme = localStorage.getItem("app_theme") || "light";
    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeBtn.textContent = "☀️";
    }

    themeBtn.addEventListener("click", () => {
        let currentTheme = document.documentElement.getAttribute("data-theme");
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("app_theme", "light");
            themeBtn.textContent = "🌙";
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("app_theme", "dark");
            themeBtn.textContent = "☀️";
        }
    });
}

// --- Streak Logic 🔥 ---
function initStreak() {
    const streakDaysElem = document.getElementById("streak-days");
    if (!streakDaysElem) return;

    let streak = parseInt(localStorage.getItem("streak_count")) || 0;
    const lastActiveDate = localStorage.getItem("last_active_date");
    const todayStr = new Date().toISOString().split('T')[0];

    if (lastActiveDate) {
        const lastDate = new Date(lastActiveDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays > 1) {
            streak = 0;
            localStorage.setItem("streak_count", streak);
        }
    }

    streakDaysElem.textContent = streak;
}

function updateStreakActivity() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveDate = localStorage.getItem("last_active_date");
    let streak = parseInt(localStorage.getItem("streak_count")) || 0;

    if (lastActiveDate !== todayStr) {
        if (lastActiveDate) {
            const lastDate = new Date(lastActiveDate);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) streak++;
            else if (diffDays > 1) streak = 1;
        } else {
            streak = 1;
        }
        
        localStorage.setItem("streak_count", streak);
        localStorage.setItem("last_active_date", todayStr);
        
        const streakDaysElem = document.getElementById("streak-days");
        if (streakDaysElem) {
            streakDaysElem.textContent = streak;
            streakDaysElem.parentElement.style.transform = "scale(1.2)";
            setTimeout(() => { streakDaysElem.parentElement.style.transform = "scale(1)"; }, 300);
        }
    }
}
