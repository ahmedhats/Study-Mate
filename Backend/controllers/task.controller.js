const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const { spawn } = require('child_process');
const path = require('path');

// Helper function to run Python scheduler
const aiScheduleTasks = async (tasks, maxHoursPerDay) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../Algorithms/taskmanager.py'),
      JSON.stringify({ tasks, maxHoursPerDay })
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
      } else {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          reject(new Error('Failed to parse Python output: ' + e.message));
        }
      }
    });
  });
};

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

// Generate schedule for tasks
const generateSchedule = async (req, res) => {
  try {
    const maxHoursPerDay = parseInt(req.query.maxHoursPerDay) || 5;
    
    // Get all incomplete tasks for the user
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { 'teamMembers.user': req.user._id }
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
};

// Get all tasks for the authenticated user (created by or has permission to)
const getTasks = async (req, res, next) => {
  try {
    // Find tasks either created by the user or where the user is in teamMembers
    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { "teamMembers.user": req.user._id }],
    })
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email");

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Get a single task
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ createdBy: req.user._id }, { "teamMembers.user": req.user._id }],
    })
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Create a new task
const createTask = async (req, res, next) => {
  try {
    // If importance is not provided, set a default based on priority
    if (!req.body.importance) {
      const priorityToImportance = {
        urgent: "critical",
        high: "important",
        medium: "normal",
        low: "optional",
      };
      req.body.importance = priorityToImportance[req.body.priority] || "normal";
    }

    // Creator always has admin permission
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      teamMembers: req.body.teamMembers || [],
    };

    // Check if creator is already in team members
    const creatorInTeam = taskData.teamMembers.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    // If not, add creator with admin permissions
    if (!creatorInTeam) {
      taskData.teamMembers.push({
        user: req.user._id,
        permissions: "admin",
      });
    }

    const task = await Task.create(taskData);

    // Populate user details before returning
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

// Check if user has permission to edit task
const hasEditPermission = async (userId, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return false;

  // Creator always has edit permission
  if (task.createdBy.toString() === userId.toString()) return true;

  // Check team members permissions
  const userTeamMember = task.teamMembers.find(
    (member) => member.user.toString() === userId.toString()
  );

  return (
    userTeamMember &&
    (userTeamMember.permissions === "edit" ||
      userTeamMember.permissions === "admin")
  );
};

// Update a task
const updateTask = async (req, res, next) => {
  try {
    // Check if user has permission to edit
    const canEdit = await hasEditPermission(req.user._id, req.params.id);
    if (!canEdit) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to edit this task"
      );
    }

    // If due date is being updated, recalculate importance unless explicitly set
    if (req.body.dueDate && !req.body.importance) {
      const now = new Date();
      const dueDate = new Date(req.body.dueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      // Base importance from priority
      let importanceLevel = req.body.priority === 'urgent' ? 3 :
                          req.body.priority === 'high' ? 2 : 1;
      
      // Adjust importance based on deadline proximity
      if (daysUntilDue <= 1) { // Due within 24 hours
        importanceLevel += 2;
      } else if (daysUntilDue <= 3) { // Due within 3 days
        importanceLevel += 1;
      }
      
      // Map final importance level
      req.body.importance = importanceLevel >= 4 ? 'critical' :
                          importanceLevel === 3 ? 'important' :
                          importanceLevel === 2 ? 'normal' : 'optional';
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Delete a task
const deleteTask = async (req, res, next) => {
  try {
    // Only creator or team members with admin permission can delete
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    // Check if user is creator
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    // Check if user is admin team member
    const isAdmin = task.teamMembers.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.permissions === "admin"
    );

    if (!isCreator && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to delete this task"
      );
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: "Task deleted successfully",
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};

// Search tasks
const searchTasks = async (req, res, next) => {
  try {
    const { query, importance, priority, startDate, endDate } = req.query;

    // Build the search criteria
    const searchCriteria = {
      $or: [{ createdBy: req.user._id }, { "teamMembers.user": req.user._id }],
    };

    // Add text search if query provided
    if (query) {
      searchCriteria.$and = [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      ];
    }

    // Add importance filter if provided
    if (importance) {
      searchCriteria.importance = importance;
    }

    // Add priority filter if provided
    if (priority) {
      searchCriteria.priority = priority;
    }

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      searchCriteria.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    // If only startDate is provided
    else if (startDate) {
      searchCriteria.dueDate = { $gte: new Date(startDate) };
    }
    // If only endDate is provided
    else if (endDate) {
      searchCriteria.dueDate = { $lte: new Date(endDate) };
    }

    const tasks = await Task.find(searchCriteria)
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Add team member to task
const addTeamMember = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { userId, permissions } = req.body;

    // Check if user has admin permission
    const canEdit = await hasEditPermission(req.user._id, taskId);
    if (!canEdit) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to modify this task"
      );
    }

    // Add team member
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          teamMembers: {
            user: userId,
            permissions: permissions || "view",
          },
        },
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Update team member permissions
const updateTeamMember = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;
    const { permissions } = req.body;

    // Check if user has admin permission
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = task.teamMembers.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.permissions === "admin"
    );

    if (!isCreator && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to modify team members"
      );
    }

    // Update team member permissions
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        "teamMembers.user": userId,
      },
      {
        $set: {
          "teamMembers.$.permissions": permissions,
        },
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    if (!updatedTask) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task or team member not found");
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Remove team member
const removeTeamMember = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;

    // Check if user has admin permission
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = task.teamMembers.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.permissions === "admin"
    );

    if (!isCreator && !isAdmin) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to remove team members"
      );
    }

    // Cannot remove the creator from the team
    if (userId === task.createdBy.toString()) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Cannot remove the task creator from the team"
      );
    }

    // Remove team member
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: {
          teamMembers: {
            user: userId,
          },
        },
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("teamMembers.user", "name email")
      .populate("createdBy", "name email");

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Get AI generated schedule
const getAISchedule = async (req, res, next) => {
  try {
    // Get tasks for the user
    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { "teamMembers.user": req.user._id }],
    });

    // Format tasks for the scheduler
    const formattedTasks = tasks.map(task => ({
      name: task.title,
      time: task.estimatedTime || 1, // Default to 1 hour if not specified
      deadline: task.dueDate,
      priority: task.priority,
      importance: task.importance,
      _id: task._id.toString(),
      progress: task.progress || 0
    }));

    // Get max hours per day from query params or use default
    const maxHoursPerDay = parseInt(req.query.maxHoursPerDay) || 5;

    // Generate schedule using Python scheduler
    const scheduleResult = await aiScheduleTasks(formattedTasks, maxHoursPerDay);

    res.json({ 
      success: true, 
      data: scheduleResult
    });
  } catch (error) {
    console.error('Schedule generation error:', error);
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate schedule: ' + error.message));
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  generateSchedule,
};
