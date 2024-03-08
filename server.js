const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
// Assuming coursesRoutes and videosRoutes are correctly implemented in their respective files
const coursesRoutes = require('./routes/coursesRoutes');
const videosRoutes = require('./routes/videosRoutes');

const app = express();
const PORT = process.env.PORT || 5000;



// Connect to MongoDB
mongoose.connect('mongodb+srv://asaharajan:KWaterloo@cluster0.6clqnb5.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User schema
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true }, // Ensure email is unique and required
    phoneNumber: String,
    role: { type: String, required: true, enum: ['student', 'educator', 'admin'] },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(express.json()); // body-parser is included in express
app.use(cors());

// Routes
// Signup or Register User
app.post('/api/users', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, role, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName, lastName, email, phoneNumber, role, password: hashedPassword
        });

        await newUser.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user');
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        res.send('Login successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Fetch User Profile
app.get('/api/user/profile', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email }, '-password'); // Exclude password from the results
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Use course and video routes
app.use('/api/courses', coursesRoutes);
app.use('/api/videos', videosRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
