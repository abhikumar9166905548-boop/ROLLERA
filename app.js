const API_URL = "https://rollera.onrender.com";

/* ---------- MODAL CONTROL ---------- */
function openSignup() {
    document.getElementById("signupModal").style.display = "flex";
}

function closeSignup() {
    document.getElementById("signupModal").style.display = "none";
}

/* ---------- LOGIN ---------- */
async function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Email aur Password bhariye!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("Login Successful 🔥");
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("app").style.display = "block";
        } else {
            alert(data.message || "Login Failed");
        }
    } catch (err) { alert("Server Error!"); }
}

/* ---------- SEND OTP ---------- */
async function sendOtpLogic() {
    const mobile = document.getElementById("signup-mobile").value;
    if (!mobile || mobile.length < 10) {
        alert("Sahi mobile number daaliye!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile })
        });
        if (res.ok) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("sendOtpBtn").style.display = "none";
            alert("Testing OTP: 123456 🔥");
        } else { alert("OTP error!"); }
    } catch { alert("Server Error!"); }
}

/* ---------- VERIFY + SIGNUP ---------- */
async function verifyAndSignup() {
    const name = document.getElementById("signup-name").value;
    const age = document.getElementById("signup-age").value;
    const email = document.getElementById("signup-email").value;
    const mobile = document.getElementById("signup-mobile").value;
    const password = document.getElementById("signup-password").value;
    const otp = document.getElementById("otpInput").value;

    if (!otp) return alert("OTP daaliye!");

    try {
        const res = await fetch(`${API_URL}/verify-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, age, email, mobile, password, otp })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Account Successfully Created 🎉 Ab Login karein.");
            closeSignup();
        } else { alert(data.message || "Signup Failed"); }
    } catch { alert("Server Error!"); }
}
