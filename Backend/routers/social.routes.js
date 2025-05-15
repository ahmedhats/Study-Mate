const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

// Get user's friends
router.get("/friends", auth.verifyToken, userController.getUserFriends);

// Friend requests endpoints
router.post("/friend-requests/send", auth.verifyToken, userController.sendFriendRequest);
router.post("/friend-requests/accept", auth.verifyToken, userController.acceptFriendRequest);
router.post("/friend-requests/reject", auth.verifyToken, userController.rejectFriendRequest);
router.post("/friend-requests/cancel", auth.verifyToken, userController.cancelFriendRequest);
router.get("/friend-requests/pending", auth.verifyToken, userController.getPendingRequests);
router.get("/friend-requests/sent", auth.verifyToken, userController.getSentRequests);

// Remove friend
router.delete("/friends/:userId", auth.verifyToken, userController.removeFriend);

// Recommended friends endpoint
router.get(
  "/recommended-friends",
  auth.verifyToken,
  userController.getRecommendedFriends
);

module.exports = router;
