const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a reminder title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  originalInput: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Personal',
    enum: ['Groceries', 'Bills', 'Work', 'Personal', 'Health', 'Shopping', 'Other']
  },
  triggerType: {
    type: String,
    enum: ['location', 'time', 'both'],
    default: 'time'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    },
    placeName: {
      type: String,
      default: ''
    },
    placeType: {
      type: String,
      default: ''
    },
    radius: {
      type: Number,
      default: 500 // meters
    }
  },
  dueDate: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'none'],
    default: 'none'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'snoozed', 'cancelled'],
    default: 'active'
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
reminderSchema.index({ 'location': '2dsphere' });

// Update the updatedAt timestamp before saving
reminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);
