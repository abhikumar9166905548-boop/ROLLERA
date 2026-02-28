const API_URL = "https://rollera.onrender.com";

// SIGNUP FUNCTION
async function signup() {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");

    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message || data.error);
}

// LOGIN FUNCTION
async function login() {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if(data.token) {
        alert("Login Successful! ✅");
        localStorage.setItem("token", data.token);
    } else {
        alert(data.message || "Login Failed");
    }
}
