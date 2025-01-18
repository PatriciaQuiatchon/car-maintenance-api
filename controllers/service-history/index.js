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
    const id = req.params.id;

    const { orderBy = 'created_at', direction = 'ASC', limit = 50 } = req.query;

    try {
        
        const validatedLimit = parseInt(limit, 10);
        if (isNaN(validatedLimit) || validatedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit value' });
        }
        const query = `
        SELECT 
            u.name as user_name,
            c.name as car_name,
            c.plate_number,
            s.name as service_name,
            s.price as amount,
            h.service_date as date,
            h.service_amount,
            sr.updated_at
        FROM 
            service_history h
        JOIN 
            user u ON h.user_id = u.user_id
        JOIN 
            vehicle c ON h.vehicle_id = c.vehicle_id
        JOIN 
            service s ON h.service_id = s.service_id
        JOIN 
            service_request sr ON h.request_id = sr.request_id
        
        ${id ? ` WHERE h.user_id = ?` : ''}
        
        ORDER BY ? ?
        
        LIMIT ?
    `;
        const defaultValues = [orderBy, direction, validatedLimit]
        const values = id ? [id, ...defaultValues] : defaultValues
        const results = await dbQuery(query, values);

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
