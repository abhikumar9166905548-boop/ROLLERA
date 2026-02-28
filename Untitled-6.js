const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const authMiddleware=require("./middleware/auth");
const User=require("./models/User");
const Reel=require("./models/Reel");
const Comment=require("./models/Comment");
const path = require('path');

// Static files (Frontend) ko serve karne ke liye
app.use(express.static(path.join(__dirname, './')));
// Jab koi main URL khole toh index.html dikhaye
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/signup') || req.path.startsWith('/login')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected!"))
.catch(err => console.log(err));
const app=express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL);

/* SIGNUP */
app.post("/signup",async(req,res)=>{
const hashed=await bcrypt.hash(req.body.password,10);
const user=new User({...req.body,password:hashed});
await user.save();
res.json({message:"User Created"});
});

/* LOGIN */
app.post("/login",async(req,res)=>{
const user=await User.findOne({email:req.body.email});
if(!user) return res.status(400).json({message:"User not found"});

const valid=await bcrypt.compare(req.body.password,user.password);
if(!valid) return res.status(400).json({message:"Wrong Password"});

const token=jwt.sign({id:user._id},"SECRETKEY");
res.json({token});
});
https://rollera.onrender.com
/* UPLOAD REEL */
app.post("/upload",authMiddleware,async(req,res)=>{
const reel=new Reel({...req.body,user:req.user.id});
await reel.save();
res.json({message:"Uploaded"});
});

/* GET REELS */
app.get("/reels",async(req,res)=>{
const reels=await Reel.find();
res.json(reels);
});
https://rollera.onrender.com
/* LIKE */
app.post("/like/:id",authMiddleware,async(req,res)=>{
await Reel.findByIdAndUpdate(req.params.id,
{$addToSet:{likes:req.user.id}});
res.json({message:"Liked"});
});
https://rollera.onrender.com
/* COMMENT */
app.post("/comment/:id",authMiddleware,async(req,res)=>{
const comment=new Comment({
reelId:req.params.id,
user:req.user.id,
text:req.body.text
});
await comment.save();
res.json({message:"Comment Added"});
});

/* FOLLOW */
app.post("/follow/:id",authMiddleware,async(req,res)=>{
await User.findByIdAndUpdate(req.user.id,
{$addToSet:{following:req.params.id}});
await User.findByIdAndUpdate(req.params.id,
{$addToSet:{followers:req.user.id}});
res.json({message:"Followed"});
});


app.listen(process.env.PORT||5000);



