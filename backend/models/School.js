const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['First', 'Second', 'Summer']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const schoolYearSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/
  },
  semesters: [semesterSchema],
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique year per teacher
schoolYearSchema.index({ teacherId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('SchoolYear', schoolYearSchema);