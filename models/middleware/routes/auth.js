const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* SEND OTP */
router.post("/send-otp", async (req,res)=>{
  const { mobile } = req.body;

  if(!mobile){
    return res.status(400).json({ message:"Mobile required" });
  }

  const otp = Math.floor(100000 + Math.random()*900000).toString();
  const expiry = new Date(Date.now()+5*60*1000);

  let user = await User.findOne({ mobile });

  if(!user){
    user = new User({ mobile });
  }

  user.otp = otp;
  user.otpExpiry = expiry;

  await user.save();

  console.log("OTP:", otp); // Production me SMS service use karo

  res.json({ message:"OTP Sent" });
});


/* VERIFY & SIGNUP */
router.post("/verify-signup", async (req,res)=>{
  const { name,email,mobile,password,otp } = req.body;

  const user = await User.findOne({ mobile });

  if(!user || user.otp !== otp || user.otpExpiry < new Date()){
    return res.status(400).json({ message:"Invalid or Expired OTP" });
  }

  const existingEmail = await User.findOne({ email });
  if(existingEmail){
    return res.status(400).json({ message:"Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password,10);

  user.name = name;
  user.email = email;
  user.password = hashedPassword;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message:"Account Created Successfully 🎉" });
});


/* LOGIN */
router.post("/login", async (req,res)=>{
  const { email,password } = req.body;

  const user = await User.findOne({ email });
  if(!user){
    return res.status(400).json({ message:"User not found" });
  }

  const isMatch = await bcrypt.compare(password,user.password);
  if(!isMatch){
    return res.status(400).json({ message:"Invalid Credentials" });
  }

  const accessToken = jwt.sign(
    { id:user._id, role:user.role },
    process.env.JWT_SECRET,
    { expiresIn:"15m" }
  );

  const refreshToken = jwt.sign(
    { id:user._id },
    process.env.JWT_SECRET,
    { expiresIn:"7d" }
  );

  res
  .cookie("refreshToken", refreshToken, {
    httpOnly:true,
    secure:false,
    sameSite:"Strict"
  })
  .json({ accessToken });
});


/* PROTECTED PROFILE */
router.get("/profile", authMiddleware, async (req,res)=>{
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;
