const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve public folder correctly
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontpage.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '../upload.html'));
});
app.post('/api/skills', async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.json(skill);
    } catch (err) {
        res.status(500).json({ message: "Error adding skill" });
    }
});

// ML Prediction API
const { spawn } = require('child_process');

app.post('/predict', (req, res) => {
    const text = req.body.text || "";
    const scriptPath = path.join(__dirname, 'model_runner.py');

    const py = spawn('python', [scriptPath, text]);

    let output = "";
    let errOutput = "";

    py.stdout.on('data', (data) => {
        output += data.toString();
    });

    py.stderr.on('data', (data) => {
        errOutput += data.toString();
    });

    py.on('close', (code) => {
        if (code !== 0) {
            console.log("PYTHON ERROR:", errOutput);
            return res.json({ result: [] });
        }

        try {
            const result = JSON.parse(output);
            console.log(result); // debug
            res.json({ result: result });
        } catch (err) {
            console.log("JSON ERROR:", err);
            console.log(output);
            res.json({ result: [] });
        }
    });
});

app.get('/loading', (req, res) => {
    res.sendFile(path.join(__dirname, '../loading.html'));
});
    

app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, '../result.html'));
});


app.get('/api/skills', async (req, res) => {
    const skills = await Skill.find();
    res.json(skills);
});

app.put('/api/skills/:id', async (req, res) => {
    const updated = await Skill.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(updated);
});

app.delete('/api/skills/:id', async (req, res) => {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../signup.html'));
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

const skillSchema = new mongoose.Schema({
    name: String,
    level: String,
    category: String
});

const Skill = mongoose.model('Skill', skillSchema);

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