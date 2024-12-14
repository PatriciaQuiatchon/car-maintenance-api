const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

const createUser = async (db, email, password, name, role) => {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt
    const id = uuidv4();

    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO user (user_id,email, password, name, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [id, email, hashedPassword, name, role], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // Return the results of the query
        });
    });
};



module.exports = { createUser };
