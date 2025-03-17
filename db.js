const mysql = require('mysql2');

// Create a connection pool (this is recommended for performance)
const pool = mysql.createPool({
  host: 'localhost',    // Database host, can be IP address or hostname
  user: 'root',         // MySQL username
  password: 'Ipalrobot1!',         // MySQL password
  database: 'ipal'  // Your database name
});

// Export the connection pool to use in other parts of your app
module.exports = pool;
