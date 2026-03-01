const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES ---
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // Static files serve karne ke liye

// --- 2. MONGODB CONNECTION ---
// Make sure aapke .env file mein MONGO_URI sahi hai
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rollera DB Connected! ✅"))
  .catch(err => console.log("DB Connection Error: ", err));

// --- 3. USER SCHEMA ---
const userSchema = new mongoose.Schema({
    fullName: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthday: String
});
const User = mongoose.model('User', userSchema);

// --- 4. ROUTES ---

// Health Check (Render ko jagaaye rakhne ke liye)
app.get('/status', (req, res) => res.send("Rollera Server is Running... 🚀"));

// OTP Route (Temporary logic)
app.post('/send-otp', (req, res) => {
    res.status(200).json({ message: "OTP Sent (Use 123456)" });
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { email, fullName, username, password, birthday } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: "Email ya Username pehle se hai!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            email, 
            fullName, 
            username, 
            password: hashedPassword, 
            birthday 
        });

        await newUser.save();
        res.status(201).json({ message: "Account Ban Gaya! 🎉" });
    } catch (err) {
        res.status(500).json({ message: "Signup Fail: " + err.message });
    }
});

// Login Route (Sahi Response format ke saath)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "User nahi mila" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Galat Password" });
        
        // Frontend ko user data bhejna zaroori hai
        res.json({ 
            message: "Success", 
            user: { 
                _id: user._id, 
                username: user.username,
                email: user.email 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 5. SERVE FRONTEND ---
// Ye line tabhi kaam karegi jab index.html backend folder mein ho
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path === '/login' || req.path === '/signup') return;
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 6. SERVER START (RENDER OPTIMIZED) ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rollera Server live on port ${PORT} 🚀`);
});
