const dbQuery = require("../../db/db");
const dayjs = require('dayjs');

const { fetchServices, changeStatusRepo, createHistory } = require("../../repository/service");
const { fetchUserByRole } = require("../../repository/user");
const { fetchVehicleByUser } = require("../../repository/vehicle");

const createServiceRequest = async (req, res) => {
    const userId = req.user.user_id;
    const { service_id, vehicle_id, preferred_schedule, mechanic_id, note } = req.body;

    try {

        const formattedDate = dayjs(preferred_schedule).format('YYYY-MM-DD HH:mm:ss');

        const query = `INSERT INTO service_request 
                        (request_id, user_id, vehicle_id, service_id, mechanic_id, preferred_schedule, request_status, notes, created_at, updated_at) 
                        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        await dbQuery(query, [userId, vehicle_id, service_id, mechanic_id, formattedDate, "pending", note]);

        res.status(201).json({ message: 'Service requested created successfully' });
    } catch (err) {
        console.error('Error creating service request:', err.message);
        res.status(500).json({ error: 'Error creating service request' });
    }
};

const updateServiceRequest = async (req, res) => {
    const requestId = req.params.id;
    const { service_id, vehicle_id, preferred_schedule, request_status, mechanic_id, notes } = req.body;
  
    try {
        const formattedDate = dayjs(preferred_schedule).format('YYYY-MM-DD HH:mm:ss');

        const query = `UPDATE service_request SET service_id = ?, vehicle_id = ?, mechanic_id = ?, preferred_schedule = ?, request_status = ?, notes = ?, updated_at = NOW() WHERE request_id = ?`;
        const result = await dbQuery(query, [service_id, vehicle_id, mechanic_id, formattedDate, request_status, notes, requestId]);
  
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
        const query = 'DELETE FROM service_request WHERE request_id = ?';
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
        const query = `SELECT * FROM service_request WHERE request_id = ?`;
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
    let userId;
    const role = req.user.role;
    if (role === "customer") {
        userId = req.user.user_id;
    }
    const onlyRequest = req.query.onlyRequest;
    const { orderBy = 'created_at', direction = 'ASC', limit = 50, status = "PENDING" } = req.query;

    try {
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }

        // Query to fetch service requests
        let query = `
            SELECT 
                sr.request_id,
                sr.preferred_schedule,
                sr.request_status,
                sr.service_id AS service_ids, -- Comma-separated service IDs
                v.name AS vehicle_name,
                v.vehicle_id,
                v.model,
                v.year,
                v.plate_number,
                s.service_id,
                s.name AS service_name,
                s.price
                ${!userId ? `, u.user_id AS requested_by_id, u.name AS requested_by` : ""}
            FROM 
                service_request sr
            JOIN 
                vehicle v ON sr.vehicle_id = v.vehicle_id
            JOIN 
                service s ON FIND_IN_SET(s.service_id, sr.service_id) > 0 -- Match each service_id
            ${!userId ? 
                'JOIN user u ON sr.user_id = u.user_id' 
                : ""
            }
            WHERE 
                sr.request_status = ?
        `;

        // Filter by user ID if available
        if (userId) {
            query += ` AND sr.user_id = ?`;
        }

        // Add ordering and limit
        query += ` ORDER BY sr.${orderBy} ${direction} LIMIT ?`;

        // Prepare the query variables
        const dbVariables = [
            status,
            ...(userId ? [userId] : []),
            validatedLimit,
        ];

        // Execute the query to fetch service requests
        const requests = await dbQuery(query, dbVariables);

        let finalResults = {
            requests,
        };

        // Fetch additional data (services, mechanics, and vehicles) only if `onlyRequest` is not true
        if (onlyRequest !== "true") {
            const services = await fetchServices(orderBy, "ASC", validatedLimit);
            const mechanics = await fetchUserByRole(orderBy, "ASC", "mechanic", validatedLimit);
            const vehicles = await fetchVehicleByUser(orderBy, direction, userId, validatedLimit);

            finalResults = {
                ...finalResults,
                services,
                mechanics,
                vehicles,
            };
        }

        res.json(finalResults);
    } catch (err) {
        console.error('Error fetching requests:', err.message);
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

const changeStatus = async (req, res) => {
    const requestId = req.params.id;
    const { request_status } = req.body;
    
    try {
        if (request_status === "DONE") {
            await createHistory(req.body, requestId)
        }
        const response = await changeStatusRepo(request_status, requestId)
        if(response === "Service request not found") {
            res.status(404).json({ error: response });
        } else if( response === "Service request changed status successfully" ){
            res.json({ message: 'Service request changed status successfully' });
        } else {
            res.status(400).json({ error: "Error changing status" });
        }

    } catch (err) {
        console.error('Error changing status:', err.message);
        res.status(500).json({ error: `Error changing status ${err.message}` });
    }

}
  
module.exports = { 
    createServiceRequest,
    updateServiceRequest,
    getServiceRequestById,
    getServiceRequests,
    deleteServiceRequest,
    changeStatus,
};
