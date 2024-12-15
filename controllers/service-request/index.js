const dbQuery = require("../../db/db");

const getServiceRequest = async (req, res) => {
    const id = req.params.id
    try {
        const query = 'SELECT * FROM service WHERE service_id = ?';
        const results = await dbQuery(query, [id]);

        if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching user by user_id:', err.message);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

const getAllServiceRequest = async (req, res) => {
    try {
        const query = 'SELECT * FROM service';
        const results = await dbQuery(query);

        if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error fetching user by user_id:', err.message);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

module.exports = {
    getServiceRequest,
    getAllServiceRequest,
}