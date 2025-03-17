const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const secret = 'secret'; // Replace with a secure secret

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const pool = mysql.createPool({
    host: '127.0.0.1',      // Change if using a remote MySQL server
    user: 'root',           // MySQL username
    password: 'Ipalrobot1!', // MySQL password
    database: 'ipal'        // Your MySQL database name
});
// Has To Match SQL Schema
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
        console.error("Error creating table:", err);
    } else {
        console.log("Users table created or already exists.");
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const age = new Date().getFullYear() - new Date(date_of_birth).getFullYear();

        pool.query(
            `INSERT INTO users (username, password, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age_in_years) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, email, first_name, last_name, gender, curr_weight, height_inches, goal_weight, date_of_birth, age],
            (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
                }
                res.json({ success: true, message: 'User registered successfully' });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// User Sign-In
app.post('/api/signin', (req, res) => {
    const { username, password } = req.body;

    pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, message: 'Server error', error: err.message });
            }
            if (results.length === 0) {
                return res.json({ success: false, message: 'Invalid username or password' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                const token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '1h' });
                res.json({ success: true, token, user });
            } else {
                res.json({ success: false, message: 'Invalid username or password' });
            }
        }
    );
});

// Get All Users
app.get('/api/users', (req, res) => {
    pool.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Server error', error: err.message });
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});