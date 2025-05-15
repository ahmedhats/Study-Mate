const express = require("express");
const router = express.Router();
const { matchUser } = require("../controllers/matchController");

router.post("/match", matchUser);

module.exports = router;
