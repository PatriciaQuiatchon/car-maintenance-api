const express = require('express');
const router = express.Router();
const { getDashboardData, getDashboardSales
    } = require('../controllers/dashboard/index');
const { authenticate } = require('../middleware/auth')

// Routes
//Dashboard Routes
router.get('/dashboard', authenticate, getDashboardData);
router.get('/sales', authenticate, getDashboardSales)
// router.get('/services', authenticate, getServices);
// router.post('/service', authenticate, createService); 
// router.put('/service/:id', authenticate, updateService);
// router.delete('/service/:id', authenticate, deleteService); 

module.exports = router;
