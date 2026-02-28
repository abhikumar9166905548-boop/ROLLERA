let currentUserId = null; // Global variable user ID track karne ke liye

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

// --- 2. Login Logic ---
async function handleLogin() {
    const emailField = document.getElementById("login-email");
    const passwordField = document.getElementById("login-password");

    if (!emailField || !passwordField) {
        return alert("Login fields nahi mile!");
    }

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
            
            // --- ID SAVE KARNA ---
            currentUserId = data.user._id; 
            
            document.getElementById("auth").style.display = "none";
            document.getElementById("mainHeader").style.display = "none";
            document.getElementById("app").style.display = "block";

            // Login hone par Profile aur Global Feed dono load karo
            if(data.user) {
                const profileUser = document.getElementById("profile-username");
                if(profileUser) profileUser.innerText = data.user.username; 
                loadProfilePosts(data.user._id); 
                loadAllPosts(); // Global Feed load karein
            }

        } else {
            alert("Login Failed: " + (data.message || "Check credentials."));
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection failed!");
    }
}

// --- 3. Navigation Functions (Screens switching) ---

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

// UPDATE: showHome ab feed refresh karega
function showHome() {
    hideAllSections();
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('reelsContainer').style.display = 'block';
    const storyContainer = document.querySelector('.story-container');
    if (storyContainer) storyContainer.style.display = 'flex';
    
    // Nayi posts load karo
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

function showReels() {
    hideAllSections();
    document.getElementById('reelsView').style.display = 'block';
    const header = document.getElementById("mainHeader");
    if (header) header.style.display = "none";
    const vid = document.querySelector('#reelsView video');
    if (vid) vid.play();
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

// --- 4. Like System ---
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

// --- 5. Extra Helpers ---
function openSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "flex"; 
}
function closeSignup() { 
    const modal = document.getElementById("signupModal");
    if(modal) modal.style.display = "none"; 
}

// --- 6. Signup Logic ---
async function handleSignup() {
    const email = document.getElementById("signup-email").value;
    const fullName = document.getElementById("signup-fullname").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    
    const day = document.getElementById("dob-day").value;
    const month = document.getElementById("dob-month").value;
    const year = document.getElementById("dob-year").value;
    const birthday = `${year}-${month}-${day}`;

    if (!email || !username || !password) {
        return alert("Please fill all required fields!");
    }

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, fullName, username, password, birthday })
        });
        const data = await res.json();
        if (res.ok) {
            alert("Account created successfully! Ab login karein. 🎉");
            closeSignup();
        } else {
            alert("Signup Failed: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert("Server error. Try again later.");
    }
}

// --- 7. Profile Posts Fetching ---
async function loadProfilePosts(userId) {
    const postGrid = document.getElementById("userPostGrid");
    if (!postGrid) return;

    try {
        const res = await fetch(`${API_URL}/posts/user/${userId}`);
        const posts = await res.json();

        postGrid.innerHTML = ""; 

        if (!posts || posts.length === 0) {
            postGrid.innerHTML = "<p style='grid-column: 1/4; text-align: center; color: #8e8e8e; margin-top: 20px;'>No posts yet</p>";
            return;
        }

        posts.forEach(post => {
            const img = document.createElement("img");
            img.src = post.url; 
            img.style.cssText = "width: 100%; aspect-ratio: 1/1; object-fit: cover; cursor: pointer;";
            img.onclick = () => alert("Post details coming soon!"); 
            postGrid.appendChild(img);
        });
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

// --- 8. Upload Reel/Post Logic ---
async function uploadMyReel() {
    const fileInput = document.getElementById('reelVideo');
    const file = fileInput.files[0];

    if (!file) return;

    alert("Uploading shuru ho rahi hai... Please wait.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", currentUserId); 

    try {
        const res = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (res.ok) {
            alert("Upload Successful! 🔥");
            showHome(); // Upload ke baad Home par le jao taaki sabko dikhe
        } else {
            alert("Upload Failed: " + (data.message || "Something went wrong"));
        }
    } catch (err) {
        console.error("Upload Error:", err);
        alert("Server error during upload.");
    } finally {
        fileInput.value = "";
    }
}

// --- 9. Load All Posts (Home Feed) ---
async function loadAllPosts() {
    const reelsContainer = document.getElementById("reelsContainer");
    if (!reelsContainer) return;

    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();

        reelsContainer.innerHTML = "";

        if (!posts || posts.length === 0) {
            reelsContainer.innerHTML = "<p style='text-align: center; color: #8e8e8e; margin-top: 50px;'>No posts available. Be the first to post!</p>";
            return;
        }

        posts.forEach(post => {
            const postHTML = `
                <div class="post-card">
                    <div class="post-header">
                        <img src="${post.userProfile || 'https://i.pravatar.cc/150?u=' + post.userId}">
                        <span style="font-weight: 600; font-size: 14px;">${post.username || 'User'}</span>
                    </div>
                    
                    ${post.url.endsWith('.mp4') || post.url.includes('video') 
                        ? `<video class="post-img" src="${post.url}" controls loop muted playsinline></video>`
                        : `<img class="post-img" src="${post.url}">`
                    }

                    <div class="post-actions">
                        <i class="fa-regular fa-heart" onclick="toggleLike(this)"></i>
                        <i class="fa-regular fa-comment"></i>
                        <i class="fa-regular fa-paper-plane"></i>
                    </div>
                    <div class="post-info">
                        <p><b>${Math.floor(Math.random() * 1000)} likes</b></p>
                        <p><b>${post.username || 'User'}</b> ${post.caption || 'No caption'}</p>
                    </div>
                </div>
            `;
            reelsContainer.innerHTML += postHTML;
        });
    } catch (err) {
        console.error("Error loading feed:", err);
    }
}

// --- 10. Search Users Logic ---
async function handleSearch() {
    const query = document.getElementById("search-input").value;
    const searchResults = document.getElementById("searchResults");
    
    if (!query) {
        searchResults.innerHTML = "<p style='text-align:center; color:gray;'>Kuch type toh karo bhai...</p>";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/search?username=${query}`);
        const users = await res.json();

        searchResults.innerHTML = "";

        if (users.length === 0) {
            searchResults.innerHTML = "<p style='text-align:center; color:gray;'>Koi nahi mila 😅</p>";
            return;
        }

        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.className = "search-item";
            userDiv.style.cssText = "display:flex; align-items:center; padding:10px; border-bottom:1px solid #262626; cursor:pointer;";
            userDiv.innerHTML = `
                <img src="https://i.pravatar.cc/150?u=${user._id}" style="width:40px; height:40px; border-radius:50%; margin-right:15px;">
                <span style="color:white; font-weight:600;">${user.username}</span>
            `;
            // Search result par click karne par uski posts load ho jayengi
            userDiv.onclick = () => {
                document.getElementById("profile-username").innerText = user.username;
                loadProfilePosts(user._id);
                showProfile();
            };
            searchResults.appendChild(userDiv);
        });
    } catch (err) {
        console.error("Search Error:", err);
    }
}

// --- 11. Logout Logic ---
function handleLogout() {
    if (confirm("Kya aap sach mein logout karna chahte hain?")) {
        currentUserId = null;
        // Wapas login screen dikhao
        document.getElementById("app").style.display = "none";
        document.getElementById("auth").style.display = "block";
        document.getElementById("mainHeader").style.display = "block";
        document.getElementById("mainHeader").innerText = "Rollera";
        
        // Input fields saaf karo
        document.getElementById("login-email").value = "";
        document.getElementById("login-password").value = "";
        
        alert("Logged out successfully! Dobara aana 👋");
    }
}
