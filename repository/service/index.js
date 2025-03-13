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
// const fetchAvailableServices = async (orderBy, direction, validatedLimit) => {
//     try {
//         const query = `
//             SELECT s.*
//             FROM service s
//             LEFT JOIN (
//                 SELECT s.service_id, COUNT(*) AS request_count
//                 FROM service_request sr
//                 JOIN service s ON FIND_IN_SET(s.service_id, sr.service_id) > 0
//                 WHERE DATE(sr.created_at) = CURDATE()
//                 GROUP BY s.service_id
//             ) sr_count ON s.service_id = sr_count.service_id
//             WHERE COALESCE(sr_count.request_count, 0) < 1
//             ORDER BY ${orderBy} ${direction}
//             LIMIT ?;
//         `;
//         const results = await dbQuery(query, [validatedLimit]);
//         return results;
//     } catch (err) {
//         throw new Error(`Error fetching services: ${err.message}`);
//     }
// };

const fetchAvailableServices = async (orderBy, direction, validatedLimit, excludedRequestId = null) => {
    try {
        const query = `
            SELECT s.*
            FROM service s
            LEFT JOIN (
                SELECT s.service_id, COUNT(*) AS request_count
                FROM service_request sr
                JOIN service s ON FIND_IN_SET(s.service_id, sr.service_id) > 0
                WHERE DATE(sr.created_at) = CURDATE()
                ${excludedRequestId ? " AND sr.request_id != ? " : ""}
                GROUP BY s.service_id
            ) sr_count ON s.service_id = sr_count.service_id
            WHERE COALESCE(sr_count.request_count, 0) < 5
            ORDER BY ${orderBy} ${direction}
            LIMIT ?;
        `;

        // Prepare parameters: add excludedRequestId if provided
        const params = excludedRequestId ? [excludedRequestId, validatedLimit] : [validatedLimit];

        const results = await dbQuery(query, params);
        return results;
    } catch (err) {
        throw new Error(`Error fetching services: ${err.message}`);
    }
};


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
    fetchAvailableServices,
}