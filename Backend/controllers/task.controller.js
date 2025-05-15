const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

// Get all tasks for the authenticated user
exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ createdBy: req.user._id });
        res.json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
};

// Get a single task
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
        }
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// Create a new task
exports.createTask = async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// Update a task
exports.updateTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        );
        if (!task) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
        }
        res.json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// Delete a task
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!task) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
        }
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Search tasks
exports.searchTasks = async (req, res, next) => {
    try {
        const { query } = req.query;
        const tasks = await Task.find({
            createdBy: req.user._id,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        res.json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
};
