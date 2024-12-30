const dbQuery = require("../../db/db");

const fetchVehicleByUser = async (orderBy, direction, userId, validatedLimit) => {
    try {

        const query = `SELECT * FROM vehicle 
            WHERE user_id = ?
            ORDER BY ${orderBy} ${direction}
            LIMIT ?
        `;
        const results = await dbQuery(query, [userId, validatedLimit]);

        return results
    } catch (err) {
        throw new Error(`Error fetching vehicle: ${err.message}`);
    }
    
};

module.exports = { 
    fetchVehicleByUser,
};
