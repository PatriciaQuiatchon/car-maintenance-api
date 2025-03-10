const dbQuery = require("../../db/db");
const { fetchVehicleByUser } = require("../../repository/vehicle/index");

const registerVehicle = async (req, res) => {
    const userId = req.params.id
    const { name, type, model, plate_number, year, } = req.body;

    try {
        const vehicleQuery = `SELECT * FROM vehicle WHERE plate_number = ?`;
        const resultVehicle = await dbQuery(vehicleQuery, [plate_number])
        
        if (resultVehicle.length > 0) {
            return res.status(400).json('Plate number already exists' );
        }

        const query = `INSERT INTO vehicle (vehicle_id, user_id, name, type, model, year, plate_number, created_at, updated_at) 
                        VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        const result = await dbQuery(query, [userId, name, type, model, year, plate_number]);

        res.status(201).json({ message: 'Vehicle registered successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating Vehicle:', err.message);
        res.status(500).json('Error creating Vehicle');
    }
};

const updateVehicle = async (req, res) => {
    const vehicle_id = req.params.id;
    const { name, type, model, plate_number, year } = req.body;
  
    try {
        const checkQuery = `SELECT vehicle_id FROM vehicle WHERE plate_number = ? AND vehicle_id != ?`;
        const existingVehicle = await dbQuery(checkQuery, [plate_number, vehicle_id]);

        if (existingVehicle.length > 0) {
            return res.status(400).json('Plate number already exists for another vehicle');
        }

      const query = `UPDATE vehicle SET name = ?, type = ?, model = ?, year = ?, plate_number = ?, updated_at = NOW() WHERE vehicle_id = ?`;
      const result = await dbQuery(query, [name, type, model, year, plate_number, vehicle_id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json('Vehicle not found');
      }
  
      res.json({ message: 'Vehicle updated successfully' });
    } catch (err) {
      console.error('Error updating vehicle:', err.message);
      res.status(500).json({ error: 'Error updating vehicle' });
    }
};

const deleteVehicle = async (req, res) => {
    const vehicleId = req.params.id;
  
    try {
        const query = 'DELETE FROM vehicle WHERE vehicle_id = ?';
        const result = await dbQuery(query, [vehicleId]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
  
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting vehicle' });
    }
};
  
const getVehicleById = async (req, res) => {
    const vehicleId = req.params.id;

    try {
    
        const query = `SELECT * FROM vehicle WHERE vehicle_id = ?`;
        const results = await dbQuery(query, [vehicleId]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching user by vehicle:', err.message);
        res.status(500).json({ error: 'Error fetching vehicle' });
    }
};


const getVehiclesByUser = async (req, res) => {
    const userId = req.params.id;
    const { orderBy = 'created_at', direction = 'ASC', limit = 100 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }

        const results = await fetchVehicleByUser(orderBy, direction, userId, validatedLimit)
        res.json(results);
    } catch (err) {
        console.error('Error fetching vehicle:', err.message);
        res.status(500).json({ error: 'Error fetching vehicle' });
    }
};
  
module.exports = { 
    registerVehicle, 
    updateVehicle,
    deleteVehicle,
    getVehicleById,
    getVehiclesByUser 
};
