const mysql = require('mysql2');

// Create a connection pool (this is recommended for performance)
const pool = mysql.createPool({
    host: 'database-1.c4foy0kcilc1.us-east-1.rds.amazonaws.com',    // Database host, can be IP address or hostname
    user: 'admin',         // MySQL username
    password: 'IpalRobot1!',         // MySQL password
    database: 'database-1  ',  // Your database name
    port: 3306
});

// Export the connection pool to use in other parts of your app
module.exports = pool;
