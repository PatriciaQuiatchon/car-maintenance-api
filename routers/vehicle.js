const express = require('express');
const router = express.Router();
const { registerVehicle, 
        updateVehicle,
        deleteVehicle,
        getVehicleById,
        getVehiclesByUser  
    } = require('../repositories/vehicle/index');

const { authenticate } = require('../middleware/auth')

// Routes
//Users Routes
router.get('/vehicle/:id', authenticate, getVehicleById);
router.get('/vehicles/:id', authenticate, getVehiclesByUser);
router.post('/vehicle', authenticate, registerVehicle); 
router.put('/vehicle/:id', authenticate, updateVehicle);
router.delete('/vehicle/:id', authenticate, deleteVehicle); 

module.exports = router;
