const dbQuery = require("../../db/db");

const createHistory = async (req, res) => {
    const { user_id, vehicle_id, service_id, service_date, service_amount } = req.body;

    try {
        const query = `INSERT INTO service_history (history_id, user_id, vehicle_id, service_id, service_date, service_amount, created_at) 
                        VALUES (UUID(), ?, ?, ?, ?, ?, NOW())`;
        const result = await dbQuery(query, [user_id, vehicle_id, service_id, service_date, service_amount]);

        res.status(201).json({ message: 'Vehicle registered successfully', userId: result.insertId });
    } catch (err) {
        console.error('Error creating Vehicle:', err.message);
        res.status(500).json({ error: 'Error creating Vehicle' });
    }
};


const getAllServiceHistory = async (req, res) => {
    const { orderBy = 'created_at', direction = 'ASC', limit = 25 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }
        const query = `
        SELECT 
            u.user_name,
            c.car_name,
            c.car_plate_number,
            s.service_name,
            s.service_amount,
            sr.service_requested_date
        FROM 
            history h
        JOIN 
            user u ON h.user_id = u.user_id
        JOIN 
            car c ON h.car_id = c.car_id
        JOIN 
            service s ON h.service_id = s.service_id
        JOIN 
            service_requested sr ON h.service_requested_id = sr.service_requested_id
        LIMIT ?
    `;

        const query1 = `
            SELECT * FROM service_history
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
            `;
        const results = await dbQuery(query, [validatedLimit]);

        res.json(results);
    } catch (err) {
        console.error('Error fetching all history:', err.message);
        res.status(500).json({ error: 'Error fetching service history' });
    }
};


const getServiceHistoryByUser = async (req, res) => {
    const userId = req.params.id;
    const { orderBy = 'created_at', direction = 'ASC', limit = 25 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }
    
        const query = `
            SELECT * FROM service_history
            WHERE user_id = ?
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
        `;
        const results = await dbQuery(query, [userId, validatedLimit]);
        res.json(results);

    } catch (err) {
        console.error('Error fetching history:', err.message);
        res.status(500).json({ error: 'Error fetching history' });
    }
};
  

const getServiceHistoryByVehicle = async (req, res) => {
    const vehicle_id = req.params.id;
    const { orderBy = 'created_at', direction = 'ASC', limit = 25 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }
    
        const query = `
            SELECT * FROM service_history
            WHERE vehicle_id = ?
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
        `;
        const results = await dbQuery(query, [vehicle_id, validatedLimit]);
        res.json(results);

    } catch (err) {
        console.error('Error fetching history:', err.message);
        res.status(500).json({ error: 'Error fetching history' });
    }
};
module.exports = { 
    createHistory,
    getAllServiceHistory, 
    getServiceHistoryByUser,
    getServiceHistoryByVehicle,
};
