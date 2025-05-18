const express = require('express')
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { validateRegister } = require('../middlewares/register.middleware');
const { validateLogin } = require('../middlewares/login.middleware');
const { verifyEmail } = require('../controllers/verify.controller');
// const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { sendEmail } = require('../utils/sendEmail.js');

const router = express.Router()

// Register
router.post('/register', validateRegister, register);

// Login
// router.post('/login', authLimiter, validateLogin, login);
router.post('/login', validateLogin, login);

// Logout
router.post('/logout', logout);

// Email verification
router.get('/verify-email', verifyEmail);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Test email route
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        await sendEmail(email, 'Test Email', '<h1>Test Email</h1><p>This is a test email to verify your SMTP settings.</p>');
        res.status(200).json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Google OAuth login
router.post('/google', require('../controllers/auth.controller').googleLogin);

module.exports = router;