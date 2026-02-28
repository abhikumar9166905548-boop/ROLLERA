let currentUserId = null; 

// API URL (Make sure your backend is running here)
const API_URL = "https://rollera.onrender.com"; 

// --- 1. Birthday Dropdowns ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    
    // Dynamic year so it stays updated
    const currentYear = new Date().getFullYear();
    if(yearSelect) for (let i = currentYear; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");

    if (!emailField || !passwordField) return alert("Login fields nahi mile!");

    const email = emailField.value;
    const password = passwordField.value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json(); 

        if (res.ok) {
            alert("Login Successful! 🔥");
            currentUserId = data.user._id; 
            
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";

            if(data.user) {
                const profileUser = document.getElementById("profile-username");
                if(profileUser) profileUser.innerText = data.user.username; 
                loadProfilePosts(data.user._id); 
                loadAllPosts(); 
            }
        } else {
            alert("Login Failed: " + (data.message || "Check credentials."));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed! Please wait 30s for Render to wake up.");
    }
}

// --- 3. Navigation ---
function hideAllSections() {
    const sections = ['homeView', 'reelsView', 'profileView', 'searchView', 'reelsContainer'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'none';

    document.querySelectorAll('video').forEach(v => v.pause());
}

function showHome() {
    hideAllSections();
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('reelsContainer').style.display = 'block';
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    
    loadAllPosts(); 

    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Rollera";
    }
}

function showSearch() {
    hideAllSections();
    document.getElementById('searchView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) header.style.display = "none";
}

// FIXED: Changed hideAllViews to hideAllSections
async function showReels() {
    hideAllSections(); 
    const reelsView = document.getElementById("reelsView");
    reelsView.style.display = "block";
    reelsView.innerHTML = "<p style='text-align:center; margin-top:50px;'>Loading Reels...</p>"; 

    try {
        const res = await fetch(`${API_URL}/reels`); 
        const reels = await res.json();
        reelsView.innerHTML = ""; 

        reels.forEach(reel => {
            const reelContainer = document.createElement("div");
            reelContainer.className = "reel-video-container";
            reelContainer.style.height = "100vh";
            reelContainer.style.scrollSnapAlign = "start";
            reelContainer.style.position = "relative";

            reelContainer.innerHTML = `
                <video src="${reel.videoUrl}" loop muted playsinline 
                       style="height: 100%; width: 100%; object-fit: cover;"
                       onclick="togglePlayPause(this)">
                </video>
                <div style="position: absolute; bottom: 80px; left: 15px; z-index: 10;">
                    <b>@${reel.username}</b>
                    <p>${reel.caption || ''}</p>
                </div>
            `;
            reelsView.appendChild(reelContainer);
        });

        const firstVideo = reelsView.querySelector("video");
        if(firstVideo) firstVideo.play();

    } catch (err) {
        console.error("Reels error:", err);
        reelsView.innerHTML = "<p style='text-align:center; margin-top:50px;'>No reels found.</p>";
    }
}

function showProfile() {
    hideAllSections();
    document.getElementById('profileView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Profile";
    }
}

// --- 4. Utilities ---
function togglePlayPause(video) {
    if (video.paused) video.play();
    else video.pause();
}

function toggleLike(element) {
    if (!element) return;
    if (element.classList.contains('fa-regular')) {
        element.classList.replace('fa-regular', 'fa-solid');
        element.style.color = "red";
    } else {
        element.classList.replace('fa-solid', 'fa-regular');
        element.style.color = "white";
    }
}

// --- 5. Signup Logic ---
async function handleSignup() {
    const email = document.getElementById("signup-email").value;
    const fullName = document.getElementById("signup-fullname").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const birthday = `${document.getElementById("dob-year").value}-${document.getElementById("dob-month").value}-${document.getElementById("dob-day").value}`;

    if (!email || !username || !password) return alert("Fill required fields!");

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName, username, password, birthday })
        });
        if (res.ok) {
            alert("Account created! 🎉");
            closeSignup();
        } else {
            const data = await res.json();
            alert("Signup Failed: " + data.message);
        }
    } catch (err) {
        alert("Server error. Try again.");
    }
}

// --- 6. Content Loading ---
async function loadProfilePosts(userId) {
    const postGrid = document.getElementById("userPostGrid");
    if (!postGrid) return;
    try {
        const res = await fetch(`${API_URL}/posts/user/${userId}`);
        const posts = await res.json();
        postGrid.innerHTML = posts.length ? "" : "<p style='grid-column:1/4; text-align:center;'>No posts yet</p>";
        posts.forEach(post => {
            const img = document.createElement("img");
            img.src = post.url; 
            img.style.cssText = "width:100%; aspect-ratio:1/1; object-fit:cover;";
            postGrid.appendChild(img);
        });
    } catch (err) { console.error(err); }
}

async function uploadMyReel() {
    if (!currentUserId) return alert("Please login first!");
    const fileInput = document.getElementById('reelVideo');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUserId); 

    try {
        const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
        if (res.ok) {
            alert("Upload Successful! 🔥");
            showHome();
        }
    } catch (err) { alert("Upload error."); }
}

async function loadAllPosts() {
    const container = document.getElementById("reelsContainer");
    if (!container) return;
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        container.innerHTML = posts.length ? "" : "<p style='text-align:center;'>Feed is empty.</p>";
        posts.forEach(post => {
            container.innerHTML += `
                <div class="post-card">
                    <div class="post-header">
                        <img src="https://i.pravatar.cc/150?u=${post.userId}">
                        <span>${post.username || 'User'}</span>
                    </div>
                    ${post.url.includes('.mp4') ? `<video class="post-img" src="${post.url}" controls></video>` : `<img class="post-img" src="${post.url}">`}
                    <div class="post-actions"><i class="fa-regular fa-heart" onclick="toggleLike(this)"></i></div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

function handleLogout() {
    if (confirm("Logout?")) {
        currentUserId = null;
        document.getElementById("app").style.display = "none";
        document.getElementById("auth").style.display = "block";
        location.reload(); 
    }
}

function openSignup() { document.getElementById("signupModal").style.display = "flex"; }
function closeSignup() { document.getElementById("signupModal").style.display = "none"; }
