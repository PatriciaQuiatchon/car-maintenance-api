const bcrypt = require('bcrypt');
const dbQuery = require('../../db/db');
const { generateToken } = require('../../middleware/auth');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const query = 'INSERT INTO users (user_id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())';
        await dbQuery(query, [name, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login User
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user[0]);
        res.json({ message: 'Login successful', token });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Google Sign-in/Sign-up
const googleAuth = async (profile) => {
  const { id, emails, displayName } = profile;

  try {
    let user = await dbQuery('SELECT * FROM user WHERE google_id = ?', [id]);

    if (user.length === 0) {
      // User does not exist, create new
      const email = emails[0].value;
      const name = displayName;
      const query = 'INSERT INTO users (user_id, name, email, google_id, role, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())';
      await dbQuery(query, [name, email, id, 'customer']);
      user = await dbQuery('SELECT * FROM user WHERE google_id = ?', [id]);
    }

    return user[0];
  } catch (err) {
    console.error('Error during Google Auth:', err.message);
    throw err;
  }
};

module.exports = { register, login, googleAuth };
