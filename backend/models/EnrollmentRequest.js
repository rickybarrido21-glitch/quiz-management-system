const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Compound index to prevent duplicate enrollment requests
enrollmentRequestSchema.index({ studentId: 1, classId: 1 }, { unique: true });
enrollmentRequestSchema.index({ classId: 1, status: 1 });

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);