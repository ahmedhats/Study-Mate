const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Helper function to calculate task priority score
const calculateTaskScore = (task) => {
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const daysUntilDue = Math.max(0, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));

  // Priority weights
  const priorityWeights = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Importance weights
  const importanceWeights = {
    critical: 4,
    important: 3,
    normal: 2,
    optional: 1
  };

  // Calculate base score
  let score = priorityWeights[task.priority] * 10 + importanceWeights[task.importance] * 5;

  // Add urgency factor based on due date
  if (daysUntilDue <= 1) {
    score *= 2; // Double score for tasks due within 24 hours
  } else if (daysUntilDue <= 3) {
    score *= 1.5; // 1.5x score for tasks due within 3 days
  }

  return score;
};

// GET /api/tasks/schedule - Generate an AI-powered schedule
router.get('/schedule', auth, async (req, res) => {
  try {
    const maxHoursPerDay = parseInt(req.query.maxHoursPerDay) || 5;
    
    // Get all incomplete tasks for the user
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user.id },
        { 'teamMembers.user': req.user.id }
      ],
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });

    if (!tasks.length) {
      return res.json({
        success: true,
        data: {
          schedule: {},
          unscheduled_tasks: []
        }
      });
    }

    // Calculate scores and prepare tasks for scheduling
    const tasksWithScores = tasks.map(task => ({
      _id: task._id,
      name: task.title,
      priority: task.priority,
      importance: task.importance,
      dueDate: task.dueDate,
      estimatedTime: task.estimatedTime || 1, // Default to 1 hour if not specified
      score: calculateTaskScore(task),
      progress: task.progress || 0
    }));

    // Sort tasks by score (highest priority first)
    tasksWithScores.sort((a, b) => b.score - a.score);

    // Generate schedule
    const schedule = {};
    const unscheduledTasks = [];
    const startHour = 9; // Start at 9 AM

    for (const task of tasksWithScores) {
      const taskDate = new Date(task.dueDate);
      const dateStr = taskDate.toISOString().split('T')[0];
      
      // Initialize the day's schedule if it doesn't exist
      if (!schedule[dateStr]) {
        schedule[dateStr] = [];
      }

      // Calculate total hours already scheduled for this day
      const scheduledHours = schedule[dateStr].reduce((sum, t) => sum + t.time, 0);

      // Check if we can fit this task
      if (scheduledHours + task.estimatedTime <= maxHoursPerDay) {
        // Calculate start time
        const startTime = `${startHour + scheduledHours}:00`;
        const endTime = `${startHour + scheduledHours + task.estimatedTime}:00`;

        schedule[dateStr].push({
          ...task,
          time: task.estimatedTime,
          start_time: startTime,
          end_time: endTime,
          days_until_deadline: Math.ceil((taskDate - new Date()) / (1000 * 60 * 60 * 24))
        });
      } else {
        unscheduledTasks.push({
          ...task,
          days_until_deadline: Math.ceil((taskDate - new Date()) / (1000 * 60 * 60 * 24))
        });
      }
    }

    res.json({
      success: true,
      data: {
        schedule,
        unscheduled_tasks: unscheduledTasks
      }
    });

  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating schedule',
      error: error.message
    });
  }
});

module.exports = router; 