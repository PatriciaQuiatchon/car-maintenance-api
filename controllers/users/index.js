const bcrypt = require("bcrypt");
const dbQuery = require("../../db/db");
const { fetchUserByRole } = require("../../repository/user");

const createUser = async (req, res) => {
    const { name, email, password, role, address, phone_num } = req.body;

    try {
        // Check if email already exists
        const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
        const existingUser = await dbQuery(checkEmailQuery, [email]);

        if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
        }

            
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt
        
        const query = 'INSERT INTO user (user_id, name, email, password, role, address, phone_num, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        const result = await dbQuery(query, [name, email, hashedPassword, role, address, phone_num]);

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: 'Error creating user' });
    }
};

const getUsersByRole = async (req, res) => {
    const role = req.params.role;
    const { orderBy = 'created_at', direction = 'ASC', limit = 100 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }

        const users = await fetchUserByRole(orderBy, direction, role, validatedLimit)
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

const getUserByEmail = async (req, res) => {
    const email = req.params.email;

    try {
        const query = 'SELECT user_id, name, email, role, phone_num FROM user WHERE email = ?';
        const results = await dbQuery(query, [email]);

        if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]); // Return the single user object
    } catch (err) {
        console.error('Error fetching user by email:', err.message);
        res.status(500).json({ error: 'Error fetching user' });
    }
};

const updateUser = async (req, res) => {
    const userId = req.params.user_id;
    const { name, email, role, phone_num, address } = req.body;
  
    try {

        const emailCheckQuery = 'SELECT user_id FROM user WHERE email = ? AND user_id != ?';
        const emailCheckResult = await dbQuery(emailCheckQuery, [email, userId]);

        if (emailCheckResult.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.log({phone_num, address})
        const query = 'UPDATE user SET name = ?, email = ?, role = ?, phone_num = ?, address = ?, updated_at = NOW() WHERE user_id = ?';
        const result = await dbQuery(query, [name, email, role, phone_num, address, userId]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        res.json({ message: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err.message);
      res.status(500).json({ error: 'Error updating user' });
    }
  };

  
const changePassword = async (req, res) => {
    const email = req.user.email;
    const user_id = req.user.user_id;
    const { old_password, new_password } = req.body;
  
    try {

        const userQuery = 'SELECT * FROM user WHERE email = ?';
        const user = await dbQuery(userQuery, [email]);

        if (user.length < 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(old_password, user[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid old password' });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        const query = 'UPDATE user SET password = ?, updated_at = NOW() WHERE user_id = ?';
        const result = await dbQuery(query, [hashedPassword, user_id]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Error on changing the password' });
        }
    
        res.json({ message: 'Password changed successfully' });
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
    getUserByEmail,
    getUsersByRole,
    updateUser,
    deleteUser,
    changePassword,
};
