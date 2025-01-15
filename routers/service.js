const express = require('express');
const router = express.Router();
const { createService, 
        updateService,
        deleteService,
        getService,
        getServices 
    } = require('../controllers/service/index');
const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/service/:id', authenticate, getService);
router.get('/services', getServices);
router.post('/service', authenticate, createService); 
router.put('/service/:id', authenticate, updateService);
router.delete('/service/:id', authenticate, deleteService); 

module.exports = router;
