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

module.exports = db;