const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// 1. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully! ✅"))
.catch(err => console.log("DB Connection Error: ", err));

// 2. User Schema (Data structure)
const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 3. Verify Token Middleware
const verifyToken = (req, res, next) => {
const token = req.headers["authorization"];
if(!token) return res.status(401).json({message:"Access Denied"});
try {
const verified = jwt.verify(token, "SECRETKEY");
req.user = verified;
next();
} catch(err) {
res.status(400).json({message:"Invalid Token"});
}
};

// 4. SIGNUP ROUTE (Yahi naya kaam hai)
app.post('/signup', async (req, res) => {
try {
const { username, password } = req.body;
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({ username, password: hashedPassword });
await newUser.save();
res.status(201).json({ message: "User registered successfully! 🎉" });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.get('/', (req, res) => res.send("Rollera Server is Live! 🚀"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const path = require('path'); // Isse file ka rasta milta hai

// Static files (CSS, Images, JS) load karne ke liye
app.use(express.static(path.join(__dirname, './'))); 

// Asli Website (index.html) ko Render par dikhane ke liye
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
