const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const { user_id, email, role } = user
    const payload = {
        user_id,
        email,
        role,
    }
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };
    
    return jwt.sign(payload, secret, options);
}

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) {
        return res.status(401).json({ error: "No token provided. "});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
}

module.exports = { generateToken, authenticate };
