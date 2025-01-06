const express = require('express');
const router = express.Router();
const { getAllServiceHistory,
    } = require('../controllers/service-history/index');
const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/history/:id', authenticate, getAllServiceHistory);
router.get('/history', authenticate, getAllServiceHistory);
// router.get('/services', authenticate, getServices);
// router.post('/service', authenticate, createService); 
// router.put('/service/:id', authenticate, updateService);
// router.delete('/service/:id', authenticate, deleteService); 

module.exports = router;
