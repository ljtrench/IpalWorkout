const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const secret = 'secret'; // Change this to a strong secret!

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'IpalRobot1!',
    database: 'ipal',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database Initialization
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                gender ENUM('Male', 'Female'),
                curr_weight DECIMAL(5,2),
                height_inches INT,
                goal_weight DECIMAL(5,2),
                date_of_birth DATE,
                age_in_years INT,
                date_excount_created DATE DEFAULT (CURRENT_DATE),
                time_excount_created TIME DEFAULT (CURRENT_TIME),
                dateTime_excount_created DATETIME DEFAULT (CURRENT_TIMESTAMP)
            );
        `);
        console.log("Database tables verified/created");
    } catch (err) {
        console.error("Database initialization error:", err);
        throw err;
    }
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth } = req.body;

    try {
        // Validate required fields
        if (!username || !password || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and email are required'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear();

        const [results] = await pool.query(
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
        res.status(500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'Username or email already exists'
                : 'Registration failed',
            error: error.message
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const [results] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Create token payload without sensitive data
        const tokenPayload = {
            userId: user.user_id,
            username: user.username
        };

        const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });

        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get Users (protected route example)
app.get('/api/users', async (req, res) => {
    try {
        const [results] = await pool.query(
            'SELECT user_id, username, email, first_name, last_name FROM users'
        );
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
});

// Server Startup
async function startServer() {
    try {
        // Verify database connection
        const connection = await pool.getConnection();
        console.log('Successfully connected to database');
        connection.release();

        // Initialize database schema
        await initializeDatabase();

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Start the application
startServer();