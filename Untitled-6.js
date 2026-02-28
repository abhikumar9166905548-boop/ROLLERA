const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require('path');
const multer = require('multer'); // Advance upload ke liye

const app = express();
app.use(express.json());
app.use(cors());

// 1. Video Storage Setting (Server par folder banayega)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 2. Models Load Karein
const User = require("./models/User");
const Reel = require("./models/Reel");

// 3. Static Files (Frontend aur Uploads ke liye)
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected! ✅"))
.catch(err => console.log(err));

/* --- ROUTES --- */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ADVANCE UPLOAD ROUTE
app.post("/upload", upload.single('video'), async (req, res) => {
    try {
        const newReel = new Reel({
            videoUrl: `/uploads/${req.file.filename}`,
            caption: req.body.caption
        });
        await newReel.save();
        res.json({ message: "Reel Uploaded Successfully! 🎬" });
    } catch (err) {
        res.status(500).json({ error: "Upload failed" });
    }
});

// SIGNUP & LOGIN (Wahi rahega jo pehle tha...)
app.post("/signup", async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashed });
    await user.save();
    res.json({ message: "User Created! 🎉" });
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, "SECRETKEY");
    res.json({ token });
});

app.get("/reels", async (req, res) => {
    const reels = await Reel.find().sort({ createdAt: -1 });
    res.json(reels);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Live on ${PORT}`));
