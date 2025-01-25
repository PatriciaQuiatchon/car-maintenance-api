
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

        res.json({
            history: results,
            request: requestResults,
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