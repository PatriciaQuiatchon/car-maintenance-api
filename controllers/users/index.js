const bcrypt = require("bcrypt");
const dbQuery = require("../../db/db");

const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if email already exists
        const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        const existingUser = await dbQuery(checkEmailQuery, [email]);

        if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
        }

            
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt
        
        // Insert the new user if email is unique
        const query = 'INSERT INTO user (user_id, name, email, password, role, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())';
        const result = await dbQuery(query, [name, email, hashedPassword, role]);

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: 'Error creating user' });
    }
};

const getUsersByRole = async (req, res) => {
    const role = req.params.role;

    try {
        const query = 'SELECT user_id, name, email, role FROM user WHERE role = ?';
        const users = await dbQuery(query, [role]); // Fetch all users
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Error fetching users' });
    }
  };
  
const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const query = 'SELECT user_id, name, email, role FROM user WHERE user_id = ?';
        const results = await dbQuery(query, [userId]);

        if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]); // Return the single user object
    } catch (err) {
        console.error('Error fetching user by user_id:', err.message);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const updateUser = async (req, res) => {
    const userId = req.params.user_id;
    const { name, email, role } = req.body;
  
    try {
      const query = 'UPDATE user SET name = ?, email = ?, role = ?, updated_at = NOW() WHERE user_id = ?';
      const result = await dbQuery(query, [name, email, role, userId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err.message);
      res.status(500).json({ error: 'Error updating user' });
    }
  };

// Delete a user
const deleteUser = async (req, res) => {
    const userId = req.params.user_id;
  
    try {
        const query = 'DELETE FROM user WHERE user_id = ?';
        const result = await dbQuery(query, [userId]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

module.exports = { 
    createUser, 
    getUserById,
    getUsersByRole,
    updateUser,
    deleteUser,
};
