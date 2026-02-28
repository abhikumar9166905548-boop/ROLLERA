const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, './')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully! ✅"))
  .catch(err => console.log("DB Error: ", err));

// Updated User Schema
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: { type: String, unique: true },
    mobile: String,
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// OTP Route (Simulated)
app.post('/send-otp', (req, res) => {
    res.status(200).json({ message: "OTP Sent (Use 123456)" });
});

// Verify and Signup Route
app.post('/verify-signup', async (req, res) => {
    try {
        const { name, age, email, mobile, password, otp } = req.body;
        if (otp !== "123456") return res.status(400).json({ message: "Galat OTP!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, age, email, mobile, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User Created!" });
    } catch (err) { res.status(500).json({ message: "Signup Fail: " + err.message }); }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User nahi mila" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Galat Password" });
    res.json({ message: "Success", token: "secret-token" });
});

app.listen(process.env.PORT || 10000, "0.0.0.0");
