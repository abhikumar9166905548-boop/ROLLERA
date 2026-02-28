// Iske peeche slash '/' mat lagana
const API_URL = "https://rollera.onrender.com"; 

// --- 1. Birthday Dropdowns (Signup ke liye) ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    if(yearSelect) for (let i = 2024; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic (Fixed & Secure) ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");

    if (!emailField || !passwordField) {
        return alert("Login fields nahi mile! HTML mein IDs check karein.");
    }

    const email = emailField.value;
    const password = passwordField.value;

    try {
        // API Call
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            alert("Login Successful! 🔥");
            
            // Header ko hide karna
            const header = document.getElementById("mainHeader");
            if (header) header.style.display = "none";

            // Screens switch karna
            const authDiv = document.getElementById("auth");
            const appDiv = document.getElementById("app");
            
            if (authDiv) authDiv.style.display = "none";
            if (appDiv) appDiv.style.display = "block";
            
        } else {
            alert("Login Failed! Email ya Password galat hai.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server se connect nahi ho pa raha. Check karein ki Render server 'Live' hai ya nahi.");
    }
}

// --- 3. Navigation (Home vs Reels switch) ---
function showReels() {
    const reelsView = document.getElementById('reelsView');
    const reelsContainer = document.getElementById('reelsContainer');
    const storyContainer = document.querySelector('.story-container');

    if (reelsView) reelsView.style.display = 'block';
    if (reelsContainer) reelsContainer.style.display = 'none';
    if (storyContainer) storyContainer.style.display = 'none';

    // Pehla video play karein
    const vid = document.querySelector('#reelsView video');
    if (vid) vid.play();
}

function showHome() {
    const reelsView = document.getElementById('reelsView');
    const reelsContainer = document.getElementById('reelsContainer');
    const storyContainer = document.querySelector('.story-container');

    if (reelsView) reelsView.style.display = 'none';
    if (reelsContainer) reelsContainer.style.display = 'block';
    if (storyContainer) storyContainer.style.display = 'flex';

    // Saare videos pause karein
    document.querySelectorAll('video').forEach(v => v.pause());
}

// --- 4. Like System (Instagram Style) ---
function toggleLike(element) {
    if (!element) return;
    
    if (element.classList.contains('fa-regular')) {
        // Like karna
        element.classList.replace('fa-regular', 'fa-solid');
        element.style.color = "red";
    } else {
        // Unlike karna
        element.classList.replace('fa-solid', 'fa-regular');
        element.style.color = "white";
    }
}

// --- 5. Signup Modal Helpers ---
function openSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "flex"; 
}

function closeSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "none"; 
}

// --- 6. PROFILE NAVIGATION ---
function showProfile() {
    // Sab kuch chupao
    if(document.getElementById('reelsView')) document.getElementById('reelsView').style.display = 'none';
    if(document.getElementById('reelsContainer')) document.getElementById('reelsContainer').style.display = 'none';
    if(document.querySelector('.story-container')) document.querySelector('.story-container').style.display = 'none';
    
    // Profile dikhao
    const profileView = document.getElementById('profileView');
    if(profileView) profileView.style.display = 'block';

    // Header ko wapas dikhana hai toh:
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Profile";
    }
}
