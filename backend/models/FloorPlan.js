const mongoose = require('mongoose');

const floorPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, 
    required: true
  },
  version: {
    type: Number,
    default: 1 
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

const FloorPlan = mongoose.model('FloorPlan', floorPlanSchema);

module.exports = FloorPlan;
