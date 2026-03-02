/* ==================== PRO-LEVEL APP LOGIC ==================== */

// 1. NAVIGATION LOGIC (Sections Switcher)
function switchSection(sectionId) {
    // सभी सेक्शन्स से 'active' क्लास हटाओ
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // चुने हुए सेक्शन को दिखाओ
    const activeSection = document.getElementById(sectionId + 'Section');
    activeSection.classList.add('active');
    activeSection.style.display = 'block';

    // नेविगेशन बार के आइकॉन का कलर बदलो
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // अगर होम फीड नहीं है तो वीडियो पॉज कर दो
    if (sectionId !== 'feed') {
        pauseAllVideos();
    }
}

// 2. AUTHENTICATION FLOW (Login System)
function openAuthModal(type) {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    
    // सभी फॉर्म छुपाओ
    document.querySelectorAll('.auth-otp-container').forEach(c => c.classList.remove('active'));
    
    // टाइप के हिसाब से फॉर्म दिखाओ
    if (type === 'phone') {
        document.getElementById('phoneAuth').classList.add('active');
    } else if (type === 'email') {
        document.getElementById('emailAuth').classList.add('active');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function sendOTP() {
    const phone = document.getElementById('phoneInput').value;
    if (phone.length < 10) return alert("Please enter valid number");
    
    document.getElementById('phoneDisplay').innerText = phone;
    document.getElementById('phoneAuth').classList.remove('active');
    document.getElementById('otpAuth').classList.add('active');
    startOTPTimer();
}

function verifyOTP() {
    // सीधे प्रोफाइल सेटअप पर ले जाओ (PRO UI)
    document.getElementById('otpAuth').classList.remove('active');
    document.getElementById('profileSetup').classList.add('active');
}

function completeProfile() {
    // लॉगिन स्क्रीन को हटाकर मेन ऐप दिखाओ
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('authModal').classList.remove('active');
    
    // ऐप के एलिमेंट्स एक्टिव करो
    document.getElementById('topHeader').style.display = 'flex';
    document.getElementById('feedSection').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';
    
    showToast("Welcome to Roller! 🎉");
}

// 3. VIDEO CONTROL (Play/Pause on Click)
function togglePlay(container) {
    const video = container.querySelector('video');
    if (video.paused) {
        pauseAllVideos();
        video.play();
    } else {
        video.pause();
    }
}

function pauseAllVideos() {
    document.querySelectorAll('video').forEach(video => video.pause());
}

// 4. LIKE SYSTEM (Double Tap Effect)
function toggleLike(btn) {
    const container = btn.closest('.action-btn');
    container.classList.toggle('liked');
    
    const icon = container.querySelector('.action-icon');
    const count = container.querySelector('.action-count');
    
    if (container.classList.contains('liked')) {
        icon.innerText = "❤️";
        icon.style.color = "#fe2c55";
        showToast("Added to Liked Videos");
    } else {
        icon.innerText = "🤍";
        icon.style.color = "white";
    }
}

// 5. COMMENTS MODAL LOGIC
function openComments() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('commentsModal').style.display = 'block';
}

function closeComments() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('commentsModal').style.display = 'none';
}

function postComment() {
    const input = document.getElementById('commentInput');
    if (input.value.trim() === "") return;
    
    showToast("Comment posted!");
    input.value = "";
}

// 6. UTILS (Toast & Sharing)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function shareVideo() {
    if (navigator.share) {
        navigator.share({
            title: 'Roller App',
            text: 'Check out this amazing video on Roller!',
            url: window.location.href
        });
    } else {
        showToast("Link copied to clipboard! 🔗");
    }
}

// 7. OTP TIMER LOGIC
function startOTPTimer() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById('otpTimer');
    const timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.innerText = "Resend Now";
        } else {
            timerDisplay.innerText = `Resend in ${timeLeft}s`;
        }
        timeLeft -= 1;
    }, 1000);
}

// Logout Function
function logout() {
    location.reload(); // सिंपल रीलोड से सब रीसेट हो जाएगा
}
