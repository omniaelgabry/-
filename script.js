document.addEventListener("DOMContentLoaded", () => {
    initPrayerTimes();
    initPrayerTracker();
    initMisbaha();
    initQuranSection();
    initNotificationsButton();
});

// تفعيل إشعارات المتصفح
function initNotificationsButton() {
    const notifyBtn = document.getElementById("notify-permission-btn");
    notifyBtn.addEventListener("click", () => {
        if (!("Notification" in window)) {
            alert("متصفحك لا يدعم الإشعارات");
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                alert("تم تفعيل إشعارات الصلاة بنجاح! 🔔");
                new Notification("✨️الرفيق اليومي✨️", { body: "سنقوم بتنبيهك بمواعيد الصلوات بإذن الله." });
            } else {
                alert("تم رفض إذن الإشعارات.");
            }
        });
    });
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
// تحديث دالة قسم القرآن الكريم في script.js
async function initQuranSection() {
    const surahSelect = document.getElementById("surah-select");
    const loadBtn = document.getElementById("load-surah-btn");
    const container = document.getElementById("quran-reader-modal");
    const bookmarkInfo = document.getElementById("bookmark-info");

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
    if (savedBookmark) {
        bookmarkInfo.textContent = `📌 آخر آية حفظتها: سورة ${savedBookmark.surah} - آية رقم ${savedBookmark.ayah}`;
    }

    loadBtn.addEventListener("click", async () => {
        const num = surahSelect.value;
        if (!num) {
            alert("الرجاء اختيار سورة أولاً");
            return;
        }

        container.innerHTML = "<p class='placeholder-text'>جاري تحميل السورة...</p>";
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${num}`);
            const data = await res.json();
            const surahData = data.data;
            
            container.innerHTML = "";
            
            // إضافة عنوان السورة في أعلى صندوق القراءة
            const titleDiv = document.createElement("div");
            titleDiv.className = "surah-title-header";
            titleDiv.textContent = `سورة ${surahData.name} (${surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'})`;
            container.appendChild(titleDiv);

            // تجميع الآيات وعرضها بشكل منظم
            const textWrapper = document.createElement("div");
            
            surahData.ayahs.forEach(ayah => {
                const span = document.createElement("span");
                span.className = "ayah-item";
                span.textContent = `${ayah.text} ﴿${ayah.numberInSurah}﴾ `;
                
                // حفظ العلامة المرجعية عند الضغط على أي آية
                span.addEventListener("click", () => {
                    localStorage.setItem("quran_bookmark", JSON.stringify({ surah: surahData.name, ayah: ayah.numberInSurah }));
                    bookmarkInfo.textContent = `📌 تم حفظ العلامة: سورة ${surahData.name} - آية ${ayah.numberInSurah}`;
                });

                textWrapper.appendChild(span);
            });

            container.appendChild(textWrapper);
        } catch (e) {
            container.innerHTML = "<p class='placeholder-text'>حدث خطأ أثناء جلب الآيات.</p>";
        }
    });
}
