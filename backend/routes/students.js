const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Class = require('../models/Class');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const { auth, teacherOrAdmin } = require('../middleware/auth');
const { sendEnrollmentNotification } = require('../utils/emailService');

const router = express.Router();

// Class Enrollment with Class Code (Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6)
router.post('/enroll', [
  auth,
  body('classCode').trim().isLength({ min: 1 }).withMessage('Class code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array()
      });
    }

    const { classCode } = req.body;
    const studentId = req.user.userId;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Only students can enroll in classes' 
      });
    }

    if (!student.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your email before enrolling in classes' 
      });
    }

    // Find class by class code (Requirement 5.4 - Invalid class code error handling)
    const classObj = await Class.findOne({ 
      classCode: classCode.toUpperCase(), 
      isActive: true 
    }).populate('teacherId', 'fullName email');

    if (!classObj) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid class code. Please check the code and try again.' 
      });
    }

    // Check for existing enrollment request (Requirement 5.5 - Prevent duplicate enrollment)
    const existingRequest = await EnrollmentRequest.findOne({
      studentId: studentId,
      classId: classObj._id
    });

    if (existingRequest) {
      let message = 'You have already requested to join this class.';
      if (existingRequest.status === 'approved') {
        message = 'You are already enrolled in this class.';
      } else if (existingRequest.status === 'rejected') {
        message = 'Your previous enrollment request was rejected.';
        if (existingRequest.rejectionReason) {
          message += ` Reason: ${existingRequest.rejectionReason}`;
        }
      }
      
      return res.status(400).json({ 
        success: false,
        message: message,
        status: existingRequest.status
      });
    }

    // Create enrollment request (Requirement 5.2)
    const enrollmentRequest = new EnrollmentRequest({
      studentId: studentId,
      classId: classObj._id,
      status: 'pending'
    });

    await enrollmentRequest.save();

    // Send notification to teacher (Requirement 5.6)
    if (classObj.teacherId && classObj.teacherId.email) {
      const className = `${classObj.courseCode} - ${classObj.courseDescription} (${classObj.year} ${classObj.section})`;
      await sendEnrollmentNotification(
        classObj.teacherId.email, 
        student.fullName, 
        className
      );
    }

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully. Please wait for teacher approval.',
      enrollmentRequest: {
        id: enrollmentRequest._id,
        status: enrollmentRequest.status,
        requestedAt: enrollmentRequest.requestedAt,
        class: {
          id: classObj._id,
          courseCode: classObj.courseCode,
          courseDescription: classObj.courseDescription,
          year: classObj.year,
          section: classObj.section,
          teacher: classObj.teacherId.fullName
        }
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during enrollment' 
    });
  }
});

// Get Student's Enrolled Classes
router.get('/my-classes', auth, async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Only students can view enrolled classes' 
      });
    }

    // Get approved enrollment requests
    const enrollments = await EnrollmentRequest.find({
      studentId: studentId,
      status: 'approved'
    }).populate({
      path: 'classId',
      populate: {
        path: 'teacherId',
        select: 'fullName email'
      }
    });

    const classes = enrollments.map(enrollment => ({
      id: enrollment.classId._id,
      courseCode: enrollment.classId.courseCode,
      courseDescription: enrollment.classId.courseDescription,
      year: enrollment.classId.year,
      section: enrollment.classId.section,
      classCode: enrollment.classId.classCode,
      teacher: enrollment.classId.teacherId.fullName,
      enrolledAt: enrollment.processedAt
    }));

    res.json({
      success: true,
      classes: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving classes' 
    });
  }
});

// Get Student's Enrollment Requests
router.get('/my-enrollment-requests', auth, async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Verify user is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ 
        success: false,
        message: 'Only students can view enrollment requests' 
      });
    }

    const requests = await EnrollmentRequest.find({
      studentId: studentId
    }).populate({
      path: 'classId',
      populate: {
        path: 'teacherId',
        select: 'fullName'
      }
    }).sort({ requestedAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      status: request.status,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      rejectionReason: request.rejectionReason,
      class: {
        id: request.classId._id,
        courseCode: request.classId.courseCode,
        courseDescription: request.classId.courseDescription,
        year: request.classId.year,
        section: request.classId.section,
        teacher: request.classId.teacherId.fullName
      }
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Get enrollment requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error retrieving enrollment requests' 
    });
  }
});

// Student registration (public endpoint)
router.post('/register', [
  body('studentId').trim().isLength({ min: 1 }),
  body('fullName').trim().isLength({ min: 2 }),
  body('course').trim().isLength({ min: 1 }),
  body('year').isIn(['1st', '2nd', '3rd', '4th', '5th']),
  body('section').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, fullName, course, year, section, email, deviceId } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }

    const student = new Student({
      studentId,
      fullName,
      course,
      year,
      section,
      email,
      deviceId
    });

    await student.save();
    res.status(201).json({ 
      message: 'Registration successful',
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        course: student.course,
        year: student.year,
        section: student.section
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student login (public endpoint)
router.post('/login', [
  body('studentId').trim().isLength({ min: 1 }),
  body('deviceId').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, deviceId } = req.body;

    const student = await Student.findOne({ studentId, isActive: true })
      .populate('subjects.subject');

    if (!student) {
      return res.status(401).json({ message: 'Invalid student ID' });
    }

    // Update device ID if provided
    if (deviceId && student.deviceId !== deviceId) {
      student.deviceId = deviceId;
      await student.save();
    }

    res.json({
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        course: student.course,
        year: student.year,
        section: student.section,
        subjects: student.subjects
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join subject with class code
router.post('/join-subject', [
  body('studentId').trim().isLength({ min: 1 }),
  body('classCode').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, classCode } = req.body;

    // Find student
    const student = await Student.findOne({ studentId, isActive: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find subject by class code
    const subject = await Subject.findOne({ 
      classCode: classCode.toUpperCase(), 
      isActive: true 
    }).populate('teacher');

    if (!subject) {
      return res.status(404).json({ message: 'Invalid class code' });
    }

    // Check if already enrolled
    const existingEnrollment = student.subjects.find(
      sub => sub.subject.toString() === subject._id.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({ 
        message: 'Already enrolled in this subject',
        isVerified: existingEnrollment.isVerified
      });
    }

    // Add subject to student (pending verification)
    student.subjects.push({
      subject: subject._id,
      isVerified: false
    });

    await student.save();

    res.json({
      message: 'Enrollment request sent. Waiting for teacher verification.',
      subject: {
        id: subject._id,
        name: subject.name,
        code: subject.code,
        teacher: subject.teacher.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student profile
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId, isActive: true })
      .populate({
        path: 'subjects.subject',
        populate: {
          path: 'teacher',
          select: 'fullName'
        }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students (teacher/admin only)
router.get('/', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subjectId } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } }
      ];
    }

    if (subjectId) {
      query['subjects.subject'] = subjectId;
    }

    const students = await Student.find(query)
      .populate('subjects.subject')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify student enrollment
router.patch('/:studentId/verify', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, isVerified } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the subject enrollment
    const enrollment = student.subjects.find(
      sub => sub.subject.toString() === subjectId
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.isVerified = isVerified;
    await student.save();

    // If verified, add student to subject's student list
    if (isVerified) {
      await Subject.findByIdAndUpdate(
        subjectId,
        { $addToSet: { students: student._id } }
      );
    } else {
      await Subject.findByIdAndUpdate(
        subjectId,
        { $pull: { students: student._id } }
      );
    }

    res.json({ message: 'Student verification updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;