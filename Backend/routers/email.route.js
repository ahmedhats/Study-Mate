const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');
const { verificationEmailTemplate } = require('../utils/templates/verifyEmail.template');
console.log("Email router loaded");
router.post('/send-verification', async (req, res) => {
    const { email, username } = req.body;
    const token = jwt.sign({ email, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    try {
    const link = `http:http://localhost:5000?token=${token}`;
        const html = verificationEmailTemplate(link, username);
        await sendEmail(email, 'Verify Your Account', html);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send email', details: err.message });
    }
});

module.exports = router;
