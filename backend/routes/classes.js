const express = require('express');
const { body, validationResult } = require('express-validator');
const Class = require('../models/Class');
const SchoolYear = require('../models/School');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const { auth, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all classes for the authenticated teacher
router.get('/', auth, async (req, res) => {
  try {
    const { schoolYearId, semester } = req.query;
    let query = { teacherId: req.user.userId };

    if (schoolYearId) query.schoolYearId = schoolYearId;
    if (semester) query.semester = semester;

    const classes = await Class.find(query)
      .populate('schoolYearId', 'year')
      .populate('enrolledStudents', 'studentId fullName email')
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create class
router.post('/', [auth, teacherOrAdmin, [
  body('schoolYearId').isMongoId().withMessage('Valid school year ID is required'),
  body('semester').isIn(['First', 'Second', 'Summer']).withMessage('Valid semester is required'),
  body('courseCode').trim().isLength({ min: 1 }).withMessage('Course code is required'),
  body('courseDescription').trim().isLength({ min: 1 }).withMessage('Course description is required'),
  body('year').isIn(['1st', '2nd', '3rd', '4th', '5th']).withMessage('Valid year is required'),
  body('section').trim().isLength({ min: 1 }).withMessage('Section is required')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolYearId, semester, courseCode, courseDescription, year, section } = req.body;

    // Verify school year exists and belongs to teacher
    const schoolYear = await SchoolYear.findOne({ _id: schoolYearId, teacherId: req.user.userId });
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    // Verify semester exists in school year
    const semesterExists = schoolYear.semesters.some(s => s.name === semester);
    if (!semesterExists) {
      return res.status(400).json({ message: 'Semester not found in school year' });
    }

    // Check for duplicate class
    const existingClass = await Class.findOne({
      teacherId: req.user.userId,
      schoolYearId,
      semester,
      courseCode: courseCode.toUpperCase(),
      year,
      section: section.toUpperCase()
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class with same course code, year, and section already exists' });
    }

    const newClass = new Class({
      teacherId: req.user.userId,
      schoolYearId,
      semester,
      courseCode: courseCode.toUpperCase(),
      courseDescription,
      year,
      section: section.toUpperCase()
    });

    await newClass.save();
    await newClass.populate('schoolYearId', 'year');

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findOne({ _id: id, teacherId: req.user.userId })
      .populate('schoolYearId', 'year')
      .populate('enrolledStudents', 'studentId fullName email');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update class
router.put('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing classCode directly
    delete updates.classCode;
    delete updates.teacherId;

    const classData = await Class.findOneAndUpdate(
      { _id: id, teacherId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('schoolYearId', 'year');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete class
router.delete('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findOne({ _id: id, teacherId: req.user.userId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if there are any quizzes associated with this class
    const Quiz = require('../models/Quiz');
    const quizCount = await Quiz.countDocuments({ classId: id });
    if (quizCount > 0) {
      return res.status(400).json({ message: 'Cannot delete class with existing quizzes' });
    }

    // Delete associated enrollment requests
    await EnrollmentRequest.deleteMany({ classId: id });

    await Class.findByIdAndDelete(id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Regenerate class code
router.patch('/:id/regenerate-code', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findOne({ _id: id, teacherId: req.user.userId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Generate new unique class code
    let isUnique = false;
    let newClassCode;
    while (!isUnique) {
      newClassCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Class.findOne({ classCode: newClassCode });
      if (!existing) isUnique = true;
    }

    classData.classCode = newClassCode;
    await classData.save();

    res.json({ classCode: newClassCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get enrollment requests for a class (Requirements 6.1, 6.2)
router.get('/:id/enrollment-requests', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'pending' } = req.query;

    const classData = await Class.findOne({ _id: id, teacherId: req.user.userId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const requests = await EnrollmentRequest.find({ classId: id, status })
      .populate('studentId', 'studentId fullName email isEmailVerified')
      .sort({ requestedAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      status: request.status,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      rejectionReason: request.rejectionReason,
      student: {
        id: request.studentId._id,
        studentId: request.studentId.studentId,
        fullName: request.studentId.fullName,
        email: request.studentId.email,
        isEmailVerified: request.studentId.isEmailVerified
      }
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Get enrollment requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/reject enrollment request (Requirements 6.3, 6.4, 6.5, 6.6)
router.patch('/enrollment-requests/:requestId', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const request = await EnrollmentRequest.findById(requestId)
      .populate('classId')
      .populate('studentId', 'fullName email');

    if (!request) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    // Verify the class belongs to the teacher
    if (request.classId.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already processed
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Enrollment request already processed' });
    }

    request.status = status;
    request.processedAt = new Date();
    request.processedBy = req.user.userId;

    if (status === 'rejected' && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      // Add student to class enrolled students (Requirement 6.5)
      await Class.findByIdAndUpdate(
        request.classId._id,
        { $addToSet: { enrolledStudents: request.studentId._id } }
      );
    }

    await request.save();

    // TODO: Send notification email to student about approval/rejection (Requirement 6.6)
    // This can be implemented later with email service

    res.json({ 
      success: true,
      message: `Enrollment request ${status} successfully`,
      request: {
        id: request._id,
        status: request.status,
        processedAt: request.processedAt,
        rejectionReason: request.rejectionReason
      }
    });
  } catch (error) {
    console.error('Process enrollment request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove student from class
router.delete('/:classId/students/:studentId', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const classData = await Class.findOne({ _id: classId, teacherId: req.user.userId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Class.findByIdAndUpdate(
      classId,
      { $pull: { enrolledStudents: studentId } }
    );

    res.json({ message: 'Student removed from class successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;