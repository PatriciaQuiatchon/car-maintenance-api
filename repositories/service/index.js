const dbQuery = require("../../db/db");

const createService = async (req, res) => {
    const { name, description, price } = req.body;

    try {
        const query = `INSERT INTO service (service_id, name, description, price, created_at, updated_at) 
                        VALUES (UUID(), ?, ?, ?, NOW(), NOW())`;
        const result = await dbQuery(query, [name, description, price]);

        res.status(201).json({ message: 'Service registered successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating service:', err.message);
        res.status(500).json({ error: 'Error creating service' });
    }
};

const updateService = async (req, res) => {
    const serviceId = req.params.id;
    const { name, description, price } = req.body;
  
    try {
      const query = `UPDATE service SET name = ?, description = ?, price = ?, updated_at = NOW() 
                        WHERE service_id = ?`;
      const result = await dbQuery(query, [name, description, price, serviceId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
  
      res.json({ message: 'Service updated successfully' });
    } catch (err) {
      console.error('Error updating service:', err.message);
      res.status(500).json({ error: 'Error updating service' });
    }
};

const deleteService = async (req, res) => {
    const serviceId = req.params.id;
  
    try {
        const query = 'DELETE FROM service WHERE service_id = ?';
        const result = await dbQuery(query, [serviceId]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
  
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting service' });
    }
};
  
const getService = async (req, res) => {
    const serviceId = req.params.id;

    try {
    
        const query = `SELECT * FROM service WHERE service_id = ?`;
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


const getServices = async (req, res) => {
    const { orderBy = 'created_at', direction = 'ASC', limit = 25 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }

        const query = `SELECT * FROM service 
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
        `;
        const results = await dbQuery(query, [validatedLimit]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching service:', err.message);
        res.status(500).json({ error: 'Error fetching service' });
    }
};
  
module.exports = { 
    createService, 
    updateService,
    deleteService,
    getService,
    getServices 
};
