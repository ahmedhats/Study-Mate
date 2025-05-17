const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { auth } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth);

// Stats routes
router.get('/', statsController.getUserStats);
router.get('/history', statsController.getStudyHistory);
router.get('/distribution', statsController.getStudyDistribution);
router.put('/', statsController.updateUserStats);

module.exports = router; 