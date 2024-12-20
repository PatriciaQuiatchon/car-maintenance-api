const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, getUsersByRole, getUserById } = require('../repositories/users/index');
const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/user/:id', authenticate, getUserById);
router.get('/users/:role', authenticate, getUsersByRole);
router.post('/user', authenticate, createUser); 
router.put('/user/:user_id', authenticate, updateUser);
router.delete('/user/:user_id', authenticate, deleteUser); 

module.exports = router;
