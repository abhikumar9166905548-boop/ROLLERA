const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();

// --- 1. CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. CLOUDINARY STORAGE SETUP (Photos & Videos) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rollera_posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
    resource_type: 'auto' 
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB Limit
});

// --- 3. MIDDLEWARES ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname))); 

// --- 4. MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Rollera DB Connected! ✅"))
  .catch(err => console.error("DB Connection Error: ", err));

// --- 5. SCHEMAS ---
const userSchema = new mongoose.Schema({
    fullName: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    birthday: String
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
    userId: String,
    url: String, 
    caption: String,
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// --- 6. ROUTES ---

// Status Check
app.get('/status', (req, res) => res.send("Rollera Server is Running... 🚀"));

// Upload Route (Cloudinary)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File nahi mili" });
        const { userId, caption } = req.body;
        
        const newPost = new Post({
            userId,
            caption,
            url: req.file.path // Cloudinary permanent URL
        });

        await newPost.save();
        res.status(200).json({ message: "Upload Success! 🔥", post: newPost });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server upload fail" });
    }
});

// Get All Posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Posts load nahi ho saki" });
    }
});

// Search Route
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).limit(10).select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { email, fullName, username, password, birthday } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: "Email/Username pehle se hai!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, fullName, username, password: hashedPassword, birthday });
        await newUser.save();
        res.status(201).json({ message: "Account Ban Gaya! 🎉" });
    } catch (err) {
        res.status(500).json({ message: "Signup Fail" });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        res.json({ message: "Success", user: { _id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// --- 7. SERVE FRONTEND (Order is Important!) ---
app.get('*', (req, res) => {
    const apiPaths = ['/api', '/login', '/signup', '/status'];
    if (apiPaths.some(p => req.path.startsWith(p))) return;
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 8. SERVER START ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rollera Live on Port ${PORT} 🚀`);
});
