const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const authenticate = async (req, res, next) => {
    try {
        let token = req.cookies?.jwtToken;

        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : req.headers.authorization;
        }

        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        }

        if (!token) {
            return res.status(401).send({ error: "No token provided" });
        }

        const verificationResult = await jwt.verify(token, process.env.SECRET_KEY);

        let rootUser = await User.findOne({ _id: verificationResult._id, "tokens.token": token });

        if (!rootUser) {
            rootUser = await User.findOne({ _id: verificationResult._id });
        }

        if (!rootUser) {
            throw new Error("Could not find User");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();

    } catch (error) {
        res.clearCookie('jwtToken', { path: '/' });
        res.status(401).send({ error: "Invalid or expired token" });
        console.log("Authentication error:", error.message);
    }
}

module.exports = authenticate;
