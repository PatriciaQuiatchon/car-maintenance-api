const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, getUsersByRole, getUserById } = require('../controllers/users/index');

// Routes
//Users Routes
router.get('/user/:id', getUserById);
router.get('/users/:role', getUsersByRole);
router.post('/user', createUser); 
router.put('/user/:user_id', updateUser);
router.delete('/user/:user_id', deleteUser); 

module.exports = router;
