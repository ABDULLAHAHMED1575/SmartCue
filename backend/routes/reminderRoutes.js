const express = require('express');
const router = express.Router();
const {
  parseReminder,
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  checkLocationReminders,
  completeReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes are protected

router.post('/parse', parseReminder);
router.post('/check-location', checkLocationReminders);
router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .get(getReminder)
  .put(updateReminder)
  .delete(deleteReminder);

router.put('/:id/complete', completeReminder);

module.exports = router;
