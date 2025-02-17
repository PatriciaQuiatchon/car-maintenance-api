
const dbQuery = require("../../db/db");
const getDashboardData = async (req, res) => {
    const user = req.user
    const userId = user.role == "customer" ? user.user_id : ""
    try {
        const serviceRequestQuery = `
            SELECT
                request_status as name,
                COUNT(*) AS count
            FROM
                service_request

            ${userId ? `WHERE user_id = ?` : ''}
            GROUP BY
                request_status;
        `
        const queryRequestParams = [];
        if (userId) queryRequestParams.push(userId);
        let requestResults = await dbQuery(serviceRequestQuery, queryRequestParams);

        if (requestResults.length === 0) {
            requestResults = []
        }

        const historyQuery = `
            SELECT 
                s.name, 
                COUNT(*) AS count
            FROM 
                service_history h
            JOIN 
                service s ON FIND_IN_SET(s.name, REPLACE(h.service_id, ', ', ',')) > 0  -- Split the multiple service_ids
            ${userId ? `WHERE h.user_id = ?` : ''}
            GROUP BY 
                s.name;
        `;

        const queryParams = [];
        if (userId) queryParams.push(userId);
        let results = await dbQuery(historyQuery, queryParams);

        if (results.length === 0) {
            results = []
        }
        // const query = `SELECT * FROM service_request WHERE user_id = ? ORDER BY updated_at DESC`;
        // const repaireResults = await dbQuery(query, [user.user_id]);
        const { orderBy = 'updated_at', direction = 'DESC'} = req.query;

        // Query to fetch service requests
        let query = `
            SELECT 
                sr.request_id,
                sr.preferred_schedule,
                sr.request_status,
                sr.notes,
                sr.image,
                sr.user_notes,
                sr.mechanic_id,
                sr.service_amount as price,
                sr.service_id AS service_ids, -- Comma-separated service IDs
                m.name AS mechanic_name,
                v.name AS vehicle_name,
                v.vehicle_id,
                v.model,
                v.year,
                v.plate_number,
                s.service_id,
                s.name AS service_name
                ${!user.user_id ? `, u.user_id AS requested_by_id, u.name AS requested_by` : ""}
            FROM 
                service_request sr
            JOIN 
                user m ON sr.mechanic_id = m.user_id
            JOIN 
                vehicle v ON sr.vehicle_id = v.vehicle_id
            JOIN 
                service s ON FIND_IN_SET(s.service_id, sr.service_id) > 0 -- Match each service_id
            ${!user.user_id ? 
                'JOIN user u ON sr.user_id = u.user_id' 
                : ""
            }
            WHERE 
                sr.user_id = ?
        `;

        // Add ordering and limit
        query += ` ORDER BY sr.${orderBy} ${direction} `;

        // Prepare the query variables
        const dbVariables = [
            ...(user.user_id ? [user.user_id] : []),
        ];

        // Execute the query to fetch service requests
        const repaireResults = await dbQuery(query, dbVariables);

        res.json({
            history: results,
            request: requestResults,
            repaireResults,
        });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Error fetching data' });
    }
};

const getDashboardSales = async (req, res) => {
    const {type} = req.query
    try {
        let query;

        if (type === "week") {
            query = `
                SELECT SUM(CONVERT(service_amount, DECIMAL)) AS total_sales, WEEK(created_at) AS week_number, YEAR(created_at) AS year
                FROM service_history
                GROUP BY year, week_number;
            `;
        } else if (type === "month") {
            query = `
                SELECT SUM(CONVERT(service_amount, DECIMAL)) AS total_sales,  DATE_FORMAT(created_at, '%b') AS month_name, YEAR(created_at) AS year
                FROM service_history
                GROUP BY year, month_name;
            `
        } else {
            query = `
                SELECT SUM(CONVERT(service_amount, DECIMAL)) AS total_sales, YEAR(created_at) AS year
                FROM service_history
                GROUP BY year;
            `;
        }
        const totalSales = await dbQuery(query);

        res.json({totalSales})
    } catch (err) {
        res.status(500).json({ error: 'Error fetching data' });
    }
}

module.exports = {
    getDashboardData,
    getDashboardSales,
}