
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
                service s ON h.service_id = s.service_id

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
            request: requestResults
        });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ error: 'Error fetching data' });
    }
};

module.exports = {
    getDashboardData,
}