const mysql = require("mysql2");
// require("dotenv").config();
const dotenv = require('dotenv');

// Load environment-specific config
if (process.env.NODE_ENV !== 'production') {
  const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
  dotenv.config({ path: envFile });
}

const db = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,      // Set in Vercel Environment Variables
  user: process.env.DB_USER,      // Set in Vercel Environment Variables
  password: process.env.DB_PASSWORD, // Set in Vercel Environment Variables
  database: process.env.DB_DATABASE, // Set in Vercel Environment Variables
  port: process.env.DB_PORT || 3306, // Default port is 3306
});

db.on("connection", (connection) => {
    console.log("DB connection established: " + connection.threadId);
});

db.on("error", (err) => {
    console.error("DB connection error:", err.message);
});

const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          return reject(err); // Reject the Promise if an error occurs
        }
        resolve(results); // Resolve the Promise with the results
      });
    });
  };
  

module.exports = dbQuery;