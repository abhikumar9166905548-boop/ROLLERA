const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
destination: './uploads/',
filename: (req, file, cb) => {
cb(null, Date.now() + path.extname(file.originalname));
}
});
const upload = multer({ storage: storage });

const User = require("./models/User");
const Reel = require("./models/Reel");

app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected! ✅"))
.catch(err => console.log("DB Error: ", err));

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/signup", async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password) {
return res.status(400).json({ message: "Email aur Password dalo!" });
}
const existingUser = await User.findOne({ email });
if (existingUser) {
return res.status(400).json({ message: "Email pehle se hai!" });
}
const hashed = await bcrypt.hash(password, 10);
const user = new User({ email: email, password: hashed });
await user.save();
res.json({ message: "User Created! 🎉 Ab Login karo." });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.post("/login", async (req, res) => {
try {
const user = await User.findOne({ email: req.body.email });
if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
return res.status(400).json({ message: "Galt ID/Password!" });
}
const token = jwt.sign({ id: user._id }, "SECRETKEY");
res.json({ token });
} catch (err) {
res.status(500).json({ error: "Login error" });
}
});

app.post("/upload", upload.single('video'), async (req, res) => {
try {
const newReel = new Reel({
videoUrl: /uploads/${req.file.filename},
caption: req.body.caption
});
await newReel.save();
res.json({ message: "Reel Uploaded! 🎬" });
} catch (err) {
res.status(500).json({ error: "Upload failed" });
}
});

app.get("/reels", async (req, res) => {
const reels = await Reel.find().sort({ createdAt: -1 });
res.json(reels);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server Live on ${PORT}));
