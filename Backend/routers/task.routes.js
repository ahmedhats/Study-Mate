// routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(auth);

// Task routes
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.get('/search', taskController.searchTasks);

module.exports = router;
