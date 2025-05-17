const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

// Public routes
router.get("/search", auth.verifyToken, userController.searchUsers);
router.get("/", userController.getAllUsers);
router.get("/profile", auth.verifyToken, userController.getOwnProfile);

// Specific routes that could conflict with :id param
router.get("/friends", auth.verifyToken, userController.getUserFriends);

// User by ID route
router.get("/:id", userController.getUserById);

// Protected routes
router.use(auth.auth);
router.put("/profile", userController.updateOwnProfile);
router.put("/last-active", userController.updateLastActive);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id/statistics", userController.updateUserStatistics);
router.post("/:id/activities", userController.addRecentActivity);

// Friend management routes
router.post(
  "/friend-requests/send",
  auth.verifyToken,
  userController.sendFriendRequest
);
router.post(
  "/friend-requests/accept",
  auth.verifyToken,
  userController.acceptFriendRequest
);
router.post(
  "/friend-requests/reject",
  auth.verifyToken,
  userController.rejectFriendRequest
);
router.delete(
  "/friends/:userId",
  auth.verifyToken,
  userController.removeFriend
);

// Admin routes
router.get("/all", auth.verifyToken, auth.isAdmin, userController.getAllUsers);

module.exports = router;
