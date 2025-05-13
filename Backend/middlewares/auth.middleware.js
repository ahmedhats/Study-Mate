const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }

        if (!user.isAccountVerified) {
            throw new ApiError(httpStatus.FORBIDDEN, 'Please verify your email address');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
        } else {
            next(error);
        }
    }
};

module.exports = auth; 