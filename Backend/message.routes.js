const express = require("express");
const router = express.Router();

// Simple route for testing
router.get("/conversations/test", (req, res) => {
  res.json({
    success: true,
    message: "Message routes are working!"
  });
});

module.exports = router; 