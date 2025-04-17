const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;
const secret = 'secret'; // Replace with a secure secret TO CHANGE LATER FOR SOMETHING MORE SECURE!

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const pool = mysql.createPool({
    host: 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com',      // Change if using a remote MySQL server
    user: 'admin',           // MySQL username
    password: 'IpalRobot1!', // MySQL password
    database: 'ipal',        // Your MySQL database name
    port: 3306
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

// Add debug event listeners
pool.on('connection', (conn) => console.log('New connection created'));
pool.on('acquire', (conn) => console.log('Connection acquired'));
pool.on('release', (conn) => console.log('Connection released'));
pool.on('enqueue', () => console.log('Waiting for available connection'));

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

// Server Startup
async function startServer() {
    try {
        // Verify database connection
        const connection = await pool.getConnection();
        console.log('Successfully connected to database');
        connection.release();

        await initializeDatabase();

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });