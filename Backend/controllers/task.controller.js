const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

// Get all tasks for the authenticated user (created by or has permission to)
exports.getTasks = async (req, res, next) => {
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
exports.getTask = async (req, res, next) => {
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
exports.createTask = async (req, res, next) => {
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
exports.updateTask = async (req, res, next) => {
  try {
    // Check if user has permission to edit
    const canEdit = await hasEditPermission(req.user._id, req.params.id);
    if (!canEdit) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have permission to edit this task"
      );
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
exports.deleteTask = async (req, res, next) => {
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
exports.searchTasks = async (req, res, next) => {
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
exports.addTeamMember = async (req, res, next) => {
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
exports.updateTeamMember = async (req, res, next) => {
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
exports.removeTeamMember = async (req, res, next) => {
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
