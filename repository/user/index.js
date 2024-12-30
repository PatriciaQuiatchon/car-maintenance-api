
const dbQuery = require("../../db/db");

const fetchUserByRole = async (orderBy, direction, role, validatedLimit) => {
    try {
        
        const query = `
        SELECT user_id, name, email, role FROM user
        WHERE role = ?
        ORDER BY ${orderBy} ${direction}
        LIMIT ?
        `;
        const users = await dbQuery(query, [role, validatedLimit]); // Fetch all users
        return users
    } catch (error) {
        throw new Error(`Error fetching users: ${err.message}`);
    }
};


module.exports = { 
    fetchUserByRole,
};
