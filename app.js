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

        // --- 6. NAVIGATION & REELS LOGIC ---

function showReels() {
    // Feed chupao, Reels dikhao
    document.querySelector('.story-container').style.display = 'none';
    document.getElementById('reelsContainer').style.display = 'none';
    document.getElementById('reelsView').style.display = 'block';
    
    // Pehla video play karo
    const firstVideo = document.querySelector('#reelsView video');
    if(firstVideo) firstVideo.play();
}

function showHome() {
    // Reels chupao, Feed dikhao
    document.querySelector('.story-container').style.display = 'flex';
    document.getElementById('reelsContainer').style.display = 'block';
    document.getElementById('reelsView').style.display = 'none';
    
    // Sare videos pause kar do
    document.querySelectorAll('video').forEach(v => v.pause());
}

// Auto Play/Pause logic on scroll
document.getElementById('reelsView').addEventListener('scroll', () => {
    const videos = document.querySelectorAll('#reelsView video');
    videos.forEach(video => {
        const rect = video.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            video.play();
        } else {
            video.pause();
        }
    });
});
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
// --- 4. LIKE SYSTEM LOGIC ---
function toggleLike(element) {
    const heartIcon = element;
    const likeCountElement = heartIcon.parentElement.nextElementSibling.querySelector('b');
    let currentLikes = parseInt(likeCountElement.innerText);

    // Check if already liked
    if (heartIcon.classList.contains('fa-regular')) {
        // LIKE KARNA
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid');
        heartIcon.style.color = "red";
        likeCountElement.innerText = (currentLikes + 1) + " likes";
        
        // Chhota sa animation effect
        heartIcon.style.transform = "scale(1.3)";
        setTimeout(() => heartIcon.style.transform = "scale(1)", 200);
    } else {
        // UNLIKE KARNA
        heartIcon.classList.remove('fa-solid');
        heartIcon.classList.add('fa-regular');
        heartIcon.style.color = "white";
        likeCountElement.innerText = (currentLikes - 1) + " likes";
    }
}

// --- 5. IMAGE ERROR HANDLER (Professional Touch) ---
// Agar koi image load nahi hui toh ye default image laga dega
document.addEventListener('error', function (e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        e.target.src = "https://via.placeholder.com/500x600?text=Rollera+Image";
    }
}, true);
