const dbQuery = require("../../db/db");
const { fetchServices } = require("../../repository/service");
const { fetchUserByRole } = require("../../repository/user");
const { fetchVehicleByUser } = require("../../repository/vehicle");

const createServiceRequest = async (req, res) => {
    const { user_id, vehicle_id, service_id, preffered_schedule, request_status, notes } = req.body;

    try {
        const query = `INSERT INTO service_request 
                        (request_id, user_id, vehicle_id, service_id, preferred_schedule, request_status, notes, created_at, updated_at) 
                        VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        const result = await dbQuery(query, [user_id, vehicle_id, service_id, preffered_schedule, request_status, notes]);

        res.status(201).json({ message: 'Service requested created successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating service request:', err.message);
        res.status(500).json({ error: 'Error creating service request' });
    }
};

const updateServiceRequest = async (req, res) => {
    const requestId = req.params.id;
    const { service_id, vehicle_id, preffered_schedule, request_status, notes } = req.body;
  
    try {
      const query = `UPDATE service_request SET service_id = ?, vehicle_id = ?, preffered_schedule = ?, request_status = ?, notes = ? updated_at = NOW() WHERE request_id = ?`;
      const result = await dbQuery(query, [service_id, vehicle_id, preffered_schedule, request_status, notes, requestId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Service request not found' });
      }
  
      res.json({ message: 'Service request updated successfully' });
    } catch (err) {
      console.error('Error updating Service request:', err.message);
      res.status(500).json({ error: 'Error updating Service request' });
    }
};

const deleteServiceRequest = async (req, res) => {
    const id = req.params.id;
  
    try {
        const query = 'DELETE FROM service_request WHERE vehicle_id = ?';
        const result = await dbQuery(query, [id]);
    
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service request not found' });
        }
  
        res.json({ message: 'Service request deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting Service request' });
    }
};
  
const getServiceRequestById = async (req, res) => {
    const id = req.params.id;

    try {
        //Modify this make it JOIN with vehicle and service 
        const query = `SELECT * FROM service_request WHERE id = ?`;
        const results = await dbQuery(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching user by Service request:', err.message);
        res.status(500).json({ error: 'Error fetching Service request' });
    }
};

const getServiceRequests = async (req, res) => {
    const userId = req.params.id
    const onlyRequest = req.query.onlyRequest
    const { orderBy = 'created_at', direction = 'ASC', limit = 50 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }
        // Base query and parameters
        let query = `SELECT * FROM service_request `;
        const params = [];

        // Add WHERE condition dynamically
        // if (userId || (filterBy && filterValue)) {
        //     query += 'WHERE ';
        //     const conditions = [];

        //     if (userId) {
        //         conditions.push('user_id = ?');
        //         params.push(userId);
        //     }

        //     if (filterBy && filterValue) {
        //         conditions.push(`${filterBy} = ?`);
        //         params.push(filterValue);
        //     }

        //     query += conditions.join(' AND ');
        // }

        // Add ORDER BY and LIMIT
        // query += ` ORDER BY ${orderBy} ${direction} LIMIT ?`;
        // params.push(validatedLimit);

        // const requests = await dbQuery(query, [userId, validatedLimit]);
        
        let finalResults =  {
            // requests,
        }
        if (onlyRequest !== "true") {

            const services = await fetchServices(orderBy, "ASC", validatedLimit)
    
            const mechanics = await fetchUserByRole(orderBy, "ASC", "mechanic", validatedLimit)
    
            const vehicles = await fetchVehicleByUser(orderBy, direction, userId, validatedLimit)

            finalResults = {
                ...finalResults,
                services,
                mechanics, 
                vehicles
            }
        }

        res.json(finalResults);
    } catch (err) {
        console.error('Error fetching requests:', err.message);
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

  
module.exports = { 
    createServiceRequest,
    updateServiceRequest,
    getServiceRequestById,
    getServiceRequests,
};
