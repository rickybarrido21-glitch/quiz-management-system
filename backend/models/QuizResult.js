const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
  isCorrect: Boolean,
  points: Number,
  timeSpent: Number // in seconds
});

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // total time in seconds
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    required: true
  },
  isSubmitted: {
    type: Boolean,
    default: true
  },
  deviceInfo: {
    deviceId: String,
    userAgent: String,
    ipAddress: String
  }
});

// Compound index for leaderboard queries
quizResultSchema.index({ quiz: 1, score: -1, completedAt: 1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);