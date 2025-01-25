const dbQuery = require("../../db/db");
const dayjs = require('dayjs');

const fetchServices = async (orderBy, direction, validatedLimit) => {
    try {
        const query = `SELECT * FROM service 
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
        `;
        const results = await dbQuery(query, [validatedLimit]);
        return results
    } catch (err) {
        throw new Error(`Error fetching services: ${err.message}`);
    }
}

const createHistory = async (data, id) => {
    const {
        user_id, vehicle_id, price, service_type
    } = data
    
    try {
        const query = `INSERT INTO service_history
                        (history_id, request_id, user_id, vehicle_id, service_id, service_date, service_amount, created_at) 
                        VALUES (UUID(), ?, ?, ?, ?, NOW(), ?, NOW())`;
        await dbQuery(query, [id, user_id, vehicle_id, service_type, price]);

    } catch (err) {
        throw new Error(`Error creating history: ${err.message}`);
    } 
}

const changeStatusRepo = async (status, id) => {
    
    try {
        const query = `UPDATE service_request SET request_status = ?, updated_at = NOW() WHERE request_id = ?`;
        const result = await dbQuery(query, [status, id]);
  
      if (result.affectedRows === 0) {
       return 'Service request not found'
      }
      return 'Service request changed status successfully'
  
    } catch (err) {
        throw new Error(`Error change status: ${err.message}`);
    }
}

module.exports = {
    fetchServices,
    createHistory,
    changeStatusRepo,
}