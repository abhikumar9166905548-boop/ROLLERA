const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const path = require('path'); // Frontend file path ke liye

const app = express();
app.use(express.json());
app.use(cors());

// 1. Static Files Setup (Frontend ko dikhane ke liye)
app.use(express.static(path.join(__dirname, './'))); 

// 2. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully! ✅"))
.catch(err => console.log("DB Connection Error: ", err));

// 3. User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 4. SIGNUP ROUTE
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User Created Successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Signup fail ho gaya" });
    }
});
// 5. LOGIN ROUTE
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, "SECRETKEY", { expiresIn: '1h' });
        res.json({ token, message: "Login Successful! 🚀" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. FRONTEND ROUTE (Ye line aapki website load karegi)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

