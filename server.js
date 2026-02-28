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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully! ✅"))
  .catch(err => console.log("DB Error: ", err));

const userSchema = new mongoose.Schema({
    name: String, age: Number, email: { type: String, unique: true },
    mobile: String, password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// OTP Route
app.post('/send-otp', (req, res) => res.json({ message: "OTP Sent (123456)" }));

// Verify Signup (Space hata kar fix kiya)
app.post('/verify-signup', async (req, res) => {
    try {
        const { name, age, email, mobile, password, otp } = req.body;
        if (otp !== "123456") return res.status(400).json({ message: "Galat OTP!" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, age, email, mobile, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Account Ban Gaya! 🎉" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server live on ${PORT}`));
