// --- Global Variables ---
let currentUserId = null; 
const API_URL = "https://rollera.onrender.com"; 
let activePostId = null; // For comments

// --- 1. Birthday Dropdowns ---
window.onload = () => {
    const monthSelect = document.getElementById('dob-month');
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if(monthSelect) months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i+1}">${m}</option>`);
    if(daySelect) for (let i = 1; i <= 31; i++) daySelect.innerHTML += `<option value="${i}">${i}</option>`;
    
    const currentYear = new Date().getFullYear();
    if(yearSelect) for (let i = currentYear; i >= 1950; i--) yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
};

// --- 2. Login Logic ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");
    const loginBtn = document.querySelector("#auth button"); 

    if (!emailField || !passwordField) return alert("HTML elements missing!");
    if (!emailField.value || !passwordField.value) return alert("Bhai, email aur password toh daalo!");

    loginBtn.innerText = "Connecting to Server..."; 
    loginBtn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: emailField.value, 
                password: passwordField.value 
            })
        });

        const data = await res.json(); 

        if (res.ok) {
            alert("Login Successful! 🔥");
            currentUserId = data.user._id; 
            
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";
            
            if(data.user && data.user.username) {
                const profileUser = document.getElementById("profile-username");
                if(profileUser) profileUser.innerText = data.user.username;
            }

            loadProfilePosts(currentUserId); 
            showHome(); 
        } else {
            alert("Login Failed: " + (data.message || "Check credentials."));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed! Please wait 30s for Render to wake up.");
    } finally {
        loginBtn.innerText = "Login"; 
        loginBtn.disabled = false;
    }
}

// --- 3. Navigation & Search Logic ---
function hideAllSections() {
    const sections = ['homeView', 'reelsView', 'profileView', 'searchView', 'reelsContainer'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'none';

    document.querySelectorAll('video').forEach(v => v.pause());
    closeComments(); 
}

function showHome() {
    hideAllSections();
    document.getElementById('homeView').style.display = 'block';
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    
    const header = document.getElementById("mainHeader");
    if (header) {
        header.style.display = "block";
        header.innerText = "Rollera";
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
    if(currentUserId) loadProfilePosts(currentUserId);
}

function showSearch() {
    hideAllSections();
    document.getElementById('searchView').style.display = 'block';
}

async function handleSearch() {
    const query = document.getElementById("search-input").value;
    const resultsDiv = document.getElementById("searchResults");
    const exploreGrid = document.getElementById("exploreGrid");

    if (query.length < 1) {
        resultsDiv.innerHTML = "";
        if(exploreGrid) exploreGrid.style.display = "grid"; 
        return;
    }

    if(exploreGrid) exploreGrid.style.display = "none"; 

    try {
        const res = await fetch(`${API_URL}/api/search?q=${query}`);
        const users = await res.json();

        resultsDiv.innerHTML = "";
        if (users.length === 0) {
            resultsDiv.innerHTML = "<p style='text-align:center; color:#999;'>No users found.</p>";
            return;
        }

        users.forEach(user => {
            const userRow = document.createElement("div");
            userRow.className = "search-item";
            userRow.style.cssText = "display:flex; align-items:center; gap:12px; padding:10px 15px; cursor:pointer;";
            
            userRow.innerHTML = `
                <img src="https://i.pravatar.cc/150?u=${user._id}" style="width:44px; height:44px; border-radius:50%;">
                <div>
                    <div style="font-weight:bold; font-size:14px; color:white;">${user.username}</div>
                    <div style="color:#8e8e8e; font-size:14px;">${user.fullName || ''}</div>
                </div>
            `;
            
            userRow.onclick = () => { alert("Opening profile of " + user.username); };
            resultsDiv.appendChild(userRow);
        });
    } catch (err) { console.error("Search Error:", err); }
}

// --- 4. Comment Logic ---
function openComments(postId) {
    activePostId = postId;
    document.getElementById("commentSheet").classList.add("active");
    document.getElementById("sheetOverlay").style.display = "block";
}

function closeComments() {
    document.getElementById("commentSheet").classList.remove("active");
    document.getElementById("sheetOverlay").style.display = "none";
    activePostId = null;
}

async function postComment() {
    const input = document.getElementById("newCommentInput");
    const commentText = input.value.trim();
    
    if(!commentText) return;

    const list = document.getElementById("commentList");
    if(list.querySelector('p')) list.innerHTML = '';

    const newComment = document.createElement("div");
    newComment.className = "comment-item";
    newComment.style.cssText = "display:flex; gap:12px; margin-bottom:15px; font-size:14px;";
    newComment.innerHTML = `
        <img src="https://i.pravatar.cc/150?u=me" style="width:32px; height:32px; border-radius:50%;">
        <div>
            <b>You</b> ${commentText}
        </div>
    `;
    list.prepend(newComment);
    input.value = "";
}

// --- 5. Upload Feature (Optimized) ---
function openUpload() {
    document.getElementById("uploadModal").style.display = "flex";
}

function closeUpload() {
    document.getElementById("uploadModal").style.display = "none";
}

async function startUpload() {
    const fileInput = document.getElementById("fileInput");
    const captionInput = document.getElementById("uploadCaption");
    const btn = event.target; // Upload button reference

    // 1. Check if file is selected
    if (!fileInput.files[0]) {
        alert("Pehle file select karo bhai!");
        return;
    }

    const file = fileInput.files[0];

    // 2. MERGED LOGIC: File Size Check (10MB Limit)
    if (file.size > 10 * 1024 * 1024) { 
        alert("Bhai, file bahut badi hai! 10MB se kam ki file upload karo.");
        return;
    }

    // 3. Prepare Data for Server
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUserId);
    formData.append("caption", captionInput.value);

    // 4. UI Feedback
    btn.innerText = "Uploading...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: formData 
        });

        const data = await res.json(); 

        if (res.ok) {
            alert("Post shared successfully! 🚀");
            closeUpload();
            location.reload(); 
        } else {
            alert("Upload fail: " + (data.error || "Server issue"));
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert("Network Error: Check if server is sleeping or file is too large.");
    } finally {
        btn.innerText = "Share";
        btn.disabled = false;
    }
}

// --- 6. Content Loading ---
async function showReels() {
    hideAllSections(); 
    const reelsView = document.getElementById("reelsView");
    if(!reelsView) return;

    reelsView.style.display = "block";
    reelsView.innerHTML = "<p style='text-align:center; color:white; margin-top:50px;'>Loading Reels...</p>"; 

    try {
        const res = await fetch(`${API_URL}/reels`); 
        const reels = await res.json();
        reelsView.innerHTML = ""; 

        reels.forEach(reel => {
            const reelContainer = document.createElement("div");
            reelContainer.className = "reel-video-container";
            reelContainer.style.position = "relative";
            
            reelContainer.innerHTML = `
                <video src="${reel.videoUrl}" loop muted playsinline 
                       style="height: 100%; width: 100%; object-fit: cover;"
                       onclick="handleReelClick(this)">
                </video>

                <i class="fa-solid fa-heart heart-animation"></i>

                <div class="reel-sidebar">
                    <div style="text-align:center;">
                        <i class="fa-solid fa-heart" style="font-size: 28px; color: white; cursor: pointer;" onclick="likeReel('${reel._id}', this)"></i>
                        <div style="font-size: 12px; color: white;">${reel.likes || 0}</div>
                    </div>
                    <div style="text-align:center;">
                        <i class="fa-solid fa-comment" style="font-size: 28px; color: white; cursor: pointer;" onclick="openComments('${reel._id}')"></i>
                        <div style="font-size: 12px; color: white;">${reel.comments || 0}</div>
                    </div>
                </div>

                <div style="position: absolute; bottom: 80px; left: 15px; z-index: 10; color: white;">
                    <b>@${reel.username}</b>
                    <p>${reel.caption || ''}</p>
                </div>
            `;
            reelsView.appendChild(reelContainer);
        });

        const firstVideo = reelsView.querySelector("video");
        if(firstVideo) firstVideo.play();

    } catch (err) {
        reelsView.innerHTML = "<p style='text-align:center; color:white; margin-top:50px;'>Server Error.</p>";
    }
}

async function loadProfilePosts(userId) {
    const postGrid = document.getElementById("userPostGrid");
    const postCountEl = document.getElementById("post-count"); 

    if (!postGrid) return;
    try {
        const res = await fetch(`${API_URL}/posts/user/${userId}`);
        const posts = await res.json();
        if(postCountEl) postCountEl.innerText = posts.length;
        postGrid.innerHTML = posts.length ? "" : "<p style='grid-column:1/4; text-align:center; color:#999; margin-top:20px;'>No posts yet</p>";
        posts.forEach(post => {
            const img = document.createElement("img");
            img.src = post.url; 
            img.style.cssText = "width:100%; aspect-ratio:1/1; object-fit:cover; cursor:pointer;";
            postGrid.appendChild(img);
        });
    } catch (err) { console.error("Profile Load Error:", err); }
}

// --- 7. Utility & Interaction Functions ---
let lastTap = 0;
function handleReelClick(video) {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
        const heart = video.parentElement.querySelector('.heart-animation');
        const likeIcon = video.parentElement.querySelector('.fa-heart');
        
        if(heart) {
            heart.style.animation = 'none';
            heart.offsetHeight; 
            heart.style.animation = 'heartPop 0.8s ease-out';
        }
        
        if(likeIcon) likeIcon.style.color = '#ff3040';
    } else {
        togglePlayPause(video);
    }
    lastTap = now;
}

function togglePlayPause(video) {
    if (video.paused) video.play();
    else video.pause();
}

function likeReel(reelId, icon) {
    icon.style.color = icon.style.color === 'rgb(255, 48, 64)' || icon.style.color === '#ff3040' ? 'white' : '#ff3040';
}

async function handleSignup() {
    try {
        const email = document.getElementById("signup-email").value;
        const fullName = document.getElementById("signup-fullname").value;
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
        const birthday = `${document.getElementById("dob-year").value}-${document.getElementById("dob-month").value}-${document.getElementById("dob-day").value}`;

        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName, username, password, birthday })
        });
        if (res.ok) {
            alert("Account Ban Gaya! 🎉 Ab login karein.");
            closeSignup();
        } else {
            const data = await res.json();
            alert("Signup Fail: " + data.message);
        }
    } catch (err) { alert("Server error."); }
}

function handleLogout() {
    if (confirm("Log out karein?")) location.reload();
}

function openSignup() { document.getElementById("signupModal").style.display = "flex"; }
function closeSignup() { document.getElementById("signupModal").style.display = "none"; }
