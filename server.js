const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rollera DB Connected! ✅"))
  .catch(err => console.log("DB Error: ", err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true }, // Naya field
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthday: String // Naya field
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// OTP Route
app.post('/send-otp', (req, res) => {
    res.status(200).json({ message: "OTP Sent (Use 123456)" });
});

// Verify & Signup (Fixed: No Space)
app.post('/verify-signup', async (req, res) => {
    try {
        const { name, age, email, mobile, password, otp } = req.body;
        if (otp !== "123456") return res.status(400).json({ message: "Galat OTP!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, age, email, mobile, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account Ban Gaya! 🎉" });
    } catch (err) {
        res.status(500).json({ message: "Signup Fail: " + err.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User nahi mila" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Galat Password" });
        
        res.json({ message: "Success", token: "rollera-token-123" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Rollera Server live on ${PORT} 🚀`));

