const express = require('express');
const router = express.Router();
const { register, login, } = require('../repositories/auth/index');
const passport = require('passport');

//Auth Routes
router.post('/auth/login', login); 
router.post('/auth/register', register); 

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.json({ message: 'Google Login successful', token });
  }
);

module.exports = router;
