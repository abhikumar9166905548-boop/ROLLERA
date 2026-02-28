const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true }
});

// Signup Route mein data save karne ka tarika
app.post('/signup', async (req, res) => {
    try {
        const { name, age, email, mobile, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            name, 
            age, 
            email, 
            mobile, 
            password: hashedPassword 
        });
        
        await newUser.save();
        res.status(201).json({ message: "User Created!" });
    } catch (err) {
        res.status(500).json({ message: "Signup fail: " + err.message });
    }
});
