// routes/tasks.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const auth = require("../middlewares/auth.middleware");

// Apply auth middleware to all routes
router.use(auth);

// Task routes
router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.get("/search", taskController.searchTasks);
router.get("/schedule", taskController.generateSchedule);
router.get("/:id", taskController.getTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Team member routes
router.post("/:taskId/team-members", taskController.addTeamMember);
router.put("/:taskId/team-members/:userId", taskController.updateTeamMember);
router.delete("/:taskId/team-members/:userId", taskController.removeTeamMember);

module.exports = router;
