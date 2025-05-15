const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

// Friend management endpoints
router.get("/friends", auth.verifyToken, userController.getUserFriends);
router.delete(
  "/friends/:userId",
  auth.verifyToken,
  userController.removeFriend
);

// Friend requests endpoints
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
router.get(
  "/friend-requests/pending",
  auth.verifyToken,
  userController.getPendingRequests
);
router.get(
  "/friend-requests/sent",
  auth.verifyToken,
  userController.getSentRequests
);

module.exports = router;
