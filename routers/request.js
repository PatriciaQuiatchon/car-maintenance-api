const express = require('express');
const router = express.Router();
const { createServiceRequest, getServiceRequestById, getServiceRequests, updateServiceRequest, 
    deleteServiceRequest, changeStatus
    } = require('../controllers/service-request/index');

const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/service-request/:id', authenticate, getServiceRequestById);
router.get('/service-requests/:id', authenticate, getServiceRequests);
router.get('/service-requests/', authenticate, getServiceRequests);
router.post('/service-request/', authenticate, createServiceRequest); 
router.put('/service-request/:id', authenticate, updateServiceRequest);
router.delete('/service-request/:id', authenticate, deleteServiceRequest);
router.post('/service-request/change/:id', authenticate, changeStatus)

module.exports = router;
