const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dbQuery = require('../../db/db');
const { generateToken } = require('../../middleware/auth');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment-specific config
if (process.env.NODE_ENV !== 'production') {
  const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
  dotenv.config({ path: envFile });
}

const transportData = {
  host: 'smtp-relay.brevo.com', 
  port: 587,
  auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
}

const register = async (req, res) => {
    const { name, email, password, validId, validIdNumber } = req.body;

    try {
        const existingUser = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
        return res.status(400).json('Email already exists' );
        }

        const existingId = await dbQuery('SELECT * FROM user WHERE validIdNumber = ?', [validIdNumber]);
        if (existingId.length > 0) {
        return res.status(400).json('ID number should be unique');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert new user
        const query = 'INSERT INTO user (user_id, name, email, password, validId, validIdNumber, role, is_verified, verification_token, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
        await dbQuery(query, [name, email, hashedPassword, validId, validIdNumber, "customer", 0, verificationToken]);

        const verificationLink = `${process.env.BASE_URL}verify?token=${verificationToken}`;
       
        const htmlContent = `<p>Hi</p>
                   <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                   <a href="${verificationLink}">Verify Email</a>
                   <p>If you did not request this, please ignore this email.</p>`
        // await transporter.sendMail(mailOptions);
        sendEmail(email, name, 'Verify Your Email Address', htmlContent)
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
      console.log({err})
        res.status(500).json(err);
    }
};

// Login User
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(400).json('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) {
            return res.status(400).json('Invalid email or password');
        }

        // Generate token
        const token = generateToken(user[0]);

        delete user[0].password
        
        res.json({ message: 'Login successful', token, user: user[0] });

    } catch (err) {
        res.status(500).json(err);
    }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
      const user = await dbQuery('SELECT * FROM user WHERE verification_token = ?', [token]);
      if (user.length === 0) {
          return res.status(400).json('Invalid or expired token');
      }

      await dbQuery('UPDATE user SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?', [token]);

      res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
      res.status(500).json(err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body
    const user = await dbQuery('SELECT * FROM user WHERE reset_password_token = ?', [token]);
    if (user.length === 0) {
        return res.status(400).json('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dbQuery('UPDATE user SET password = ?, reset_password_token = NULL WHERE user_id = ?', [hashedPassword, user[0].user_id]);

    res.status(200).json({ message: 'Password changed successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const existingUser = await dbQuery('SELECT * FROM user WHERE email = ?', [email]);

    if (existingUser.length < 0) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');

    const query = 'UPDATE user SET reset_password_token = ? WHERE email = ?';
    await dbQuery(query, [token, email]);

    const verificationLink = `${process.env.BASE_URL}forgot-password/?token=${token}`;
    subject = "Reset your password";
    htmlContent = `<html><body>
    <p>Hi ${existingUser[0].name},</p>
    <p>Please reset your password by clicking the link below:</p>
    <a href="${verificationLink}">Reset your password</a>
    <p>If you did not request this, please ignore this email.</p>
    </body></html>`;
    
    sendEmail(email, existingUser[0].name, subject, htmlContent)

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log({err})
    res.status(500).json({ message: err })
  }
}

const sendEmail = async (email, name, subject, html) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: "No Reply",
          email: "quiatchonpatriciamae1@gmail.com",
        },
        to: [
          {
            email: email,
            name: name,
          },
        ],
        subject:subject,
        htmlContent:html,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key':"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",
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Email sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
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

module.exports = { register, login, googleAuth, verifyEmail, forgotPassword, resetPassword, sendEmail };
