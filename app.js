const API_URL = "https://rollera.onrender.com"; // Apna sahi Render URL check karein

function openSignup() { document.getElementById("signupModal").style.display = "flex"; }
function closeSignup() { document.getElementById("signupModal").style.display = "none"; }

async function sendOtpLogic() {
    const mobile = document.getElementById("signup-mobile").value;
    if (!mobile || mobile.length < 10) return alert("Sahi mobile number daaliye!");
    
    try {
        const res = await fetch(`${API_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile })
        });
        if (res.ok) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("sendOtpBtn").style.display = "none";
            alert("OTP bhej diya gaya!");
        }
    } catch (e) { alert("Server error!"); }
}

async function verifyAndSignup() {
    const userData = {
        name: document.getElementById("signup-name").value,
        age: document.getElementById("signup-age").value,
        email: document.getElementById("signup-email").value,
        mobile: document.getElementById("signup-mobile").value,
        password: document.getElementById("signup-password").value,
        otp: document.getElementById("otpInput").value
    };

    if (!userData.otp) return alert("OTP daaliye!");

    try {
        const res = await fetch(`${API_URL}/verify-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            alert("Account Ban Gaya! 🎉 Ab Login karein.");
            location.reload();
        } else {
            const data = await res.json();
            alert(data.message || "Signup failed");
        }
    } catch (e) { alert("Server Connection Fail!"); }
}
