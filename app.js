const API_URL = "https://rollera.onrender.com"; 

// --- 1. Birthday Dropdowns Bharne ka Logic ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    if(yearSelect) for (let i = 2024; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Signup & Login Logic ---
function openSignup() { document.getElementById("signupModal").style.display = "flex"; }
function closeSignup() { document.getElementById("signupModal").style.display = "none"; }

async function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        alert("Login Successful! 🔥");
        
        // --- YE RAHI WO LINE JO HUMNE ADD KI HAI ---
        if(document.getElementById("mainHeader")) {
            document.getElementById("mainHeader").style.display = "none";
        }
        // ------------------------------------------

        document.getElementById("auth").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else { 
        alert("Login Failed!"); 
    }
}

async function verifyAndSignup() {
    const data = {
        name: document.getElementById("signup-name").value,
        username: document.getElementById("signup-username").value,
        email: document.getElementById("signup-email").value,
        password: document.getElementById("signup-password").value,
        birthday: `${document.getElementById("dob-day").value}-${document.getElementById("dob-month").value}-${document.getElementById("dob-year").value}`,
        otp: "123456" // Default testing ke liye
    };

    const res = await fetch(`${API_URL}/verify-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Account Created! 🎉 Ab login karein.");
        location.reload();
    } else { alert("Signup fail!"); }
}

// --- 3. REELS UPLOAD & FEED LOGIC ---
async function uploadMyReel() {
    const videoFile = document.getElementById("reelVideo").files[0];
    const caption = document.getElementById("reelCaption").value;

    if (!videoFile) return alert("Please select a video first!");

    alert("Video uploading feature coming soon! Backend setup ho raha hai.");
    console.log("Uploading:", videoFile.name, "with caption:", caption);
}

async function loadFeed() {
    const container = document.getElementById("reelsContainer");
    // Future mein yahan reels backend se load hongi
}
