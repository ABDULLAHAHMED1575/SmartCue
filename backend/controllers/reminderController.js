const Reminder = require('../models/Reminder');
const nlpService = require('../services/nlpService');
const googleMapsService = require('../services/googleMapsService');

// @desc    Parse natural language reminder
// @route   POST /api/reminders/parse
// @access  Private
const parseReminder = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reminder text'
      });
    }

    const parsed = nlpService.parseReminder(text);

    // If location is mentioned, try to geocode it
    if (parsed.location && parsed.location.placeName) {
      try {
        const locationData = await googleMapsService.geocodePlace(parsed.location.placeName);
        if (locationData) {
          parsed.location = {
            ...parsed.location,
            ...locationData
          };
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        // Continue without geocoding
      }
    }

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const reminderData = {
      user: req.user._id,
      ...req.body
    };

    // If originalInput is provided and no title, parse it
    if (reminderData.originalInput && !reminderData.title) {
      const parsed = nlpService.parseReminder(reminderData.originalInput);
      reminderData.title = parsed.task;
      reminderData.category = parsed.category || reminderData.category;
      reminderData.priority = parsed.priority || reminderData.priority;
      reminderData.triggerType = parsed.triggerType || reminderData.triggerType;

      if (parsed.dueDate) {
        reminderData.dueDate = parsed.dueDate;
      }

      // Geocode location if needed
      if (parsed.location && parsed.location.placeName) {
        try {
          const locationData = await googleMapsService.geocodePlace(parsed.location.placeName);
          if (locationData) {
            reminderData.location = {
              type: 'Point',
              coordinates: locationData.coordinates,
              address: locationData.address,
              placeName: parsed.location.placeName,
              placeType: locationData.placeType,
              radius: parsed.location.radius || 500
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
    }

    const reminder = await Reminder.create(reminderData);

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all reminders for user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const { status, category, triggerType } = req.query;

    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (triggerType) {
      filter.triggerType = triggerType;
    }

    const reminders = await Reminder.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this reminder'
      });
    }

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this reminder'
      });
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this reminder'
      });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check location-based reminders
// @route   POST /api/reminders/check-location
// @access  Private
const checkLocationReminders = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    // Find active location-based reminders for this user
    const reminders = await Reminder.find({
      user: req.user._id,
      status: 'active',
      triggerType: { $in: ['location', 'both'] },
      isTriggered: false
    });

    const triggeredReminders = [];

    for (const reminder of reminders) {
      if (reminder.location && reminder.location.coordinates) {
        const [targetLng, targetLat] = reminder.location.coordinates;
        const radius = reminder.location.radius || 500;

        const isNearby = googleMapsService.isWithinRadius(
          latitude,
          longitude,
          targetLat,
          targetLng,
          radius
        );

        if (isNearby) {
          reminder.isTriggered = true;
          reminder.triggeredAt = new Date();
          await reminder.save();
          triggeredReminders.push(reminder);
        }
      }
    }

    res.json({
      success: true,
      count: triggeredReminders.length,
      data: triggeredReminders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
const completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Make sure user owns reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    reminder.status = 'completed';
    reminder.completedAt = new Date();
    await reminder.save();

    res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  parseReminder,
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  checkLocationReminders,
  completeReminder
};
