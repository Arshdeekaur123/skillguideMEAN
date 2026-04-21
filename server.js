const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve public folder correctly
app.use(express.static(path.join(__dirname, '../../public')));

// ✅ Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontpage.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../signup.html'));
});
// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/skillguide")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

    const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// API
app.get('/api/jobs', (req, res) => {
    res.json([
        { title: 'Frontend Developer', type: 'Full Time' },
        { title: 'Data Analyst', type: 'Internship' }
    ]);
});



app.post('/register-user', async (req, res) => {
    
    try {
        console.log("REGISTER HIT");
        console.log(req.body);
        const { username, email, password } = req.body;

        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // save to MongoDB
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.json({ message: "Registered successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error saving user" });
    }
});

app.post('/login-user', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        res.json({ message: "Login successful" });
    } else {
        res.json({ message: "Wrong password" });
    }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));