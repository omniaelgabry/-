import { auth, db, signOut, onAuthStateChanged, updateProfile, doc, getDoc } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const loadingMsg = document.getElementById("loading-msg");
    const profileContent = document.getElementById("profile-content");
    const userNameElem = document.getElementById("user-name");
    const userEmailElem = document.getElementById("user-email");
    const userAvatarElem = document.getElementById("user-avatar");
    
    const statStreakElem = document.getElementById("stat-streak");
    const statMisbahaElem = document.getElementById("stat-misbaha");
    
    const editBtn = document.getElementById("edit-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const editForm = document.getElementById("edit-form");
    const saveBtn = document.getElementById("save-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const editNameInput = document.getElementById("edit-name-input");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loadingMsg.style.display = "none";
            profileContent.style.display = "block";
            
            const displayName = user.displayName || "مستخدم الرفيق";
            userNameElem.textContent = displayName;
            userEmailElem.textContent = user.email;
            userAvatarElem.textContent = displayName.charAt(0).toUpperCase();

            // Fetch stats from Firestore
            try {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    statStreakElem.textContent = (data.streak || 0) + " 🔥";
                } else {
                    statStreakElem.textContent = (localStorage.getItem("streak_count") || 0) + " 🔥";
                }
            } catch (e) {
                console.error("Error fetching stats:", e);
                statStreakElem.textContent = (localStorage.getItem("streak_count") || 0) + " 🔥";
            }
            
            // Total Misbaha count from localStorage
            statMisbahaElem.textContent = localStorage.getItem("misbaha_count") || 0;

        } else {
            // User not logged in, redirect to index
            window.location.href = "index.html";
        }
    });

    editBtn.addEventListener("click", () => {
        editForm.style.display = "flex";
        editBtn.style.display = "none";
        editNameInput.value = auth.currentUser.displayName || "";
    });

    cancelEditBtn.addEventListener("click", () => {
        editForm.style.display = "none";
        editBtn.style.display = "block";
    });

    saveBtn.addEventListener("click", async () => {
        const newName = editNameInput.value.trim();
        if (!newName) {
            alert("يرجى إدخال اسم صحيح");
            return;
        }

        saveBtn.textContent = "جاري الحفظ...";
        try {
            await updateProfile(auth.currentUser, { displayName: newName });
            userNameElem.textContent = newName;
            userAvatarElem.textContent = newName.charAt(0).toUpperCase();
            editForm.style.display = "none";
            editBtn.style.display = "block";
            alert("تم تحديث الاسم بنجاح!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("حدث خطأ أثناء التحديث.");
        } finally {
            saveBtn.textContent = "حفظ التعديل";
        }
    });

    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            // Will redirect automatically due to onAuthStateChanged
        } catch (error) {
            alert("حدث خطأ أثناء تسجيل الخروج");
        }
    });
});
