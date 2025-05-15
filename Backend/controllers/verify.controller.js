const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: 'Account already verified' });
        }

        user.isAccountVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Account verified successfully' });

    } catch (error) {
        console.error('Email verification error');
        res.status(500).json({ 
            success: false, 
            message: 'Email verification failed. Please try again or request a new verification link.' 
        });
    }
}