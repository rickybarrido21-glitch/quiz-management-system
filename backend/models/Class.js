const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolYearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolYear',
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['First', 'Second', 'Summer']
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true
  },
  courseDescription: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd', '4th', '5th']
  },
  section: {
    type: String,
    required: true,
    uppercase: true
  },
  classCode: {
    type: String,
    unique: true,
    uppercase: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique class code before saving
classSchema.pre('save', async function(next) {
  if (!this.classCode) {
    let isUnique = false;
    while (!isUnique) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await mongoose.model('Class').findOne({ classCode: code });
      if (!existing) {
        this.classCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

// Compound index to ensure unique course per teacher/semester
classSchema.index({ teacherId: 1, schoolYearId: 1, semester: 1, courseCode: 1, year: 1, section: 1 }, { unique: true });
classSchema.index({ classCode: 1 }, { unique: true });
classSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Class', classSchema);