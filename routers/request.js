const express = require('express');
const router = express.Router();
const { createServiceRequest, getServiceRequestById, getServiceRequests, updateServiceRequest
    } = require('../controllers/service-request/index');

const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/service-request/:id', authenticate, getServiceRequestById);
router.get('/service-requests/:id', authenticate, getServiceRequests);
router.post('/service-request/:id', authenticate, createServiceRequest); 
router.put('/service-request/:id', authenticate, updateServiceRequest);
// router.delete('/vehicle/:id', authenticate, deleteVehicle); 

module.exports = router;
