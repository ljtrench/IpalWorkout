const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
 
const app = express();
const port = 3000;
const secret = 'secret'; // Replace with a secure secret TO CHANGE LATER FOR SOMETHING MORE SECURE!
 
app.use(cors({
    origin: 'http://localhost:3000', // Add your frontend URLs
    credentials: true
}));
app.use(bodyParser.json());
 
// MySQL Connection
const pool = mysql.createPool({
    host: 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com',      // Change if using a remote MySQL server
    user: 'admin',           // MySQL username
    password: 'IpalRobot1!', // MySQL password
    database: 'ipal',        // Your MySQL database name
    port: 3306
});

//Verify DB Connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
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
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
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

        // Remove sensitive data before sending user info
        const { password: _, ...userWithoutPassword } = user;

        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            secret,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
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