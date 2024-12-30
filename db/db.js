const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
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