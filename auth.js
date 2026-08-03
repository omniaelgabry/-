import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginBtnHeader = document.getElementById("login-btn-header");
    const authModal = document.getElementById("auth-modal");
    const closeBtn = document.getElementById("auth-close-btn");
    const switchBtn = document.getElementById("auth-switch-btn");
    const submitBtn = document.getElementById("auth-submit-btn");
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const title = document.getElementById("auth-title");
    const switchText = document.getElementById("auth-switch-text");

    let isLoginMode = true;

    if(loginBtnHeader) {
        loginBtnHeader.addEventListener("click", () => {
            if (auth.currentUser) {
                signOut(auth).then(() => {
                    alert("تم تسجيل الخروج بنجاح");
                });
            } else {
                authModal.style.display = "flex";
            }
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener("click", () => {
            authModal.style.display = "none";
        });
    }

    if(switchBtn) {
        switchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                title.textContent = "تسجيل الدخول";
                submitBtn.textContent = "دخول";
                switchText.textContent = "ليس لديك حساب؟";
                switchBtn.textContent = "إنشاء حساب";
            } else {
                title.textContent = "إنشاء حساب جديد";
                submitBtn.textContent = "إنشاء الحساب";
                switchText.textContent = "لديك حساب بالفعل؟";
                switchBtn.textContent = "تسجيل الدخول";
            }
        });
    }

    if(submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                alert("يرجى إدخال البريد وكلمة المرور");
                return;
            }

            try {
                if (isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, password);
                    alert("تم تسجيل الدخول بنجاح!");
                } else {
                    await createUserWithEmailAndPassword(auth, email, password);
                    alert("تم إنشاء الحساب بنجاح!");
                }
                authModal.style.display = "none";
                syncDataToFirebase();
            } catch (error) {
                alert("حدث خطأ: " + error.message);
            }
        });
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginBtnHeader.textContent = "تسجيل الخروج";
            loginBtnHeader.style.color = "#ff6b6b";
            loginBtnHeader.style.borderColor = "#ff6b6b";
            // Sync on login
            syncDataToFirebase();
        } else {
            loginBtnHeader.textContent = "تسجيل الدخول";
            loginBtnHeader.style.color = "var(--text-dark)";
            loginBtnHeader.style.borderColor = "var(--text-muted)";
        }
    });

    async function syncDataToFirebase() {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;
        const userRef = doc(db, "users", uid);
        
        // Save local streak to Firebase (simple logic: local overrides or max wins)
        const localStreak = parseInt(localStorage.getItem("streak_count")) || 0;
        const lastActive = localStorage.getItem("last_active_date") || "";

        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.streak > localStreak) {
                    localStorage.setItem("streak_count", data.streak);
                    if(data.lastActive) localStorage.setItem("last_active_date", data.lastActive);
                    document.getElementById("streak-days").textContent = data.streak;
                } else {
                    await setDoc(userRef, { streak: localStreak, lastActive: lastActive }, { merge: true });
                }
            } else {
                await setDoc(userRef, { streak: localStreak, lastActive: lastActive }, { merge: true });
            }
        } catch(e) {
            console.error("Sync error:", e);
        }
    }
});
