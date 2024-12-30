const dbQuery = require("../../db/db");

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

module.exports = {
    fetchServices,
}