const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Protected routes
router.use(auth);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/statistics', userController.updateUserStatistics);
router.post('/:id/activities', userController.addRecentActivity);

module.exports = router;