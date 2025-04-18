require('dotenv').config();
const rateLimit = require('express-rate-limit');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const secret = process.env.JWT_SECRET || 'your_secure_secret_here'; // Changed to use environment variable

// Enhanced CORS Configuration
const allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'https://main.d19os6k506ayxk.amplifyapp.com',
    'https://18.212.50.45'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Enhanced MySQL Connection Pool
const pool = mysql.createPool({
    host: 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'IpalRobot1!',
    database: 'ipal',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 25,
    queueLimit: 0
});

// Database Initialization with Error Handling
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    gender ENUM('Male', 'Female', 'Other'),
    curr_weight DECIMAL(5,2),
    height_inches INT,
    goal_weight DECIMAL(5,2),
    date_of_birth DATE,
    age_in_years INT,
    date_excount_created DATE DEFAULT (CURRENT_DATE),
    time_excount_created TIME DEFAULT (CURRENT_TIME),
    dateTime_excount_created DATETIME DEFAULT (CURRENT_TIMESTAMP)
  );
`, (err) => {
    if (err) {
        console.error("Database initialization error:", err);
        process.exit(1); // Exit if we can't set up the database
    }
    console.log("Users table verified/ready");
});

// Enhanced User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth } = req.body;

    // Basic validation
    if (!username || !password || !email) {
        return res.status(400).json({
            success: false,
            message: 'Username, password and email are required'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear();

        const [results] = await pool.promise().query(
            `INSERT INTO users (username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age_in_years) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age]
        );

        res.json({
            success: true,
            message: 'User registered successfully',
            userId: results.insertId
        });
    } catch (error) {
        console.error("Registration error:", error);
        const message = error.code === 'ER_DUP_ENTRY'
            ? 'Username or email already exists'
            : 'Registration failed';
        res.status(500).json({
            success: false,
            message,
            error: error.message
        });
    }
});

// Enhanced User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        const [users] = await pool.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                username: user.username
            },
            secret,
            { expiresIn: '1h' }
        );

        // Return user data (excluding sensitive information)
        const userData = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        };

        res.json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Protected User Endpoint
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.promise().query(
            'SELECT user_id, username, email, first_name, last_name FROM users'
        );
        res.json(users);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server with enhanced logging
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});