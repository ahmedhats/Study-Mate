const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth(), taskController.getTasks);

// Search tasks
router.get('/search', auth(), taskController.searchTasks);

// Get AI schedule
router.get('/schedule', auth(), taskController.getAISchedule);

// Get single task
router.get('/:id', auth(), taskController.getTask);

// Create task
router.post('/', auth(), taskController.createTask);

// Update task
router.put('/:id', auth(), taskController.updateTask);

// Delete task
router.delete('/:id', auth(), taskController.deleteTask);

// Team member routes
router.post('/:taskId/team', auth(), taskController.addTeamMember);
router.put('/:taskId/team/:userId', auth(), taskController.updateTeamMember);
router.delete('/:taskId/team/:userId', auth(), taskController.removeTeamMember);

module.exports = router; 