const express = require('express');
const router = express.Router();
const studySessionController = require('../controllers/studySession.controller');
const auth = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(auth);

// Study session routes
router.get('/', studySessionController.getAllStudySessions);
router.post('/', studySessionController.createStudySession);
router.get('/:id', studySessionController.getStudySessionDetails);
router.post('/:id/join', studySessionController.joinStudySession);
router.post('/:id/leave', studySessionController.leaveStudySession);
router.put('/:id', studySessionController.updateStudySession);
router.delete('/:id', studySessionController.deleteStudySession);

module.exports = router; 