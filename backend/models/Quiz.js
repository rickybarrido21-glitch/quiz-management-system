const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'essay']
  },
  question: {
    type: String,
    required: true
  },
  options: [String], // For multiple choice questions
  correctAnswer: String, // For all question types
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 60
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  availableFrom: Date,
  availableUntil: Date,
  isActive: {
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

// Update the updatedAt field before saving
quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
quizSchema.index({ classId: 1, isActive: 1 });
quizSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);