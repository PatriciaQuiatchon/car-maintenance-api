const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const db = require("./db/db");
const { createUser } = require("./module/users/index");
const port = process.env.PORT

app.use(bodyParser.json());

app.post("/api/user", async (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const result = await createUser(db, email, password, name, role);
        res.status(201).json({ message: "User created successfully", userId: result.insertId });
    } catch (err) {
        console.error("Error creating user:", err.message);
        res.status(500).json({ message: "Error creating user." });
    }
});


app.listen(port, () => {
    console.log("Server is running on port 3000");
});
