const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const SchoolYear = require('../models/School');
const { auth, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const { schoolYearId, semester, teacherId } = req.query;
    let query = { isActive: true };

    if (schoolYearId) query.schoolYear = schoolYearId;
    if (semester) query.semester = semester;
    if (teacherId) query.teacher = teacherId;

    // If teacher, only show their subjects
    if (req.user.role === 'teacher') {
      query.teacher = req.user.userId;
    }

    const subjects = await Subject.find(query)
      .populate('schoolYear', 'year')
      .populate('teacher', 'fullName email')
      .populate('students', 'studentId fullName course year section')
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create subject
router.post('/', [auth, teacherOrAdmin, [
  body('name').trim().isLength({ min: 1 }),
  body('code').trim().isLength({ min: 1 }),
  body('schoolYearId').isMongoId(),
  body('semester').isIn(['First', 'Second', 'Summer'])
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, schoolYearId, semester, teacherId } = req.body;

    // Verify school year exists
    const schoolYear = await SchoolYear.findById(schoolYearId);
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    // Check if subject code already exists for this school year and semester
    const existingSubject = await Subject.findOne({
      code,
      schoolYear: schoolYearId,
      semester
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Subject code already exists for this semester' });
    }

    // Generate unique class code
    let classCode;
    let isUnique = false;
    while (!isUnique) {
      classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Subject.findOne({ classCode });
      if (!existing) isUnique = true;
    }

    const subject = new Subject({
      name,
      code,
      description,
      schoolYear: schoolYearId,
      semester,
      teacher: teacherId || req.user.userId,
      classCode
    });

    await subject.save();
    await subject.populate('schoolYear', 'year');
    await subject.populate('teacher', 'fullName email');

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subject by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate('schoolYear', 'year')
      .populate('teacher', 'fullName email')
      .populate('students', 'studentId fullName course year section');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check authorization
    if (req.user.role === 'teacher' && subject.teacher._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update subject
router.put('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check authorization
    if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow changing class code directly
    delete updates.classCode;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('schoolYear', 'year').populate('teacher', 'fullName email');

    res.json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Regenerate class code
router.patch('/:id/regenerate-code', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check authorization
    if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate new unique class code
    let classCode;
    let isUnique = false;
    while (!isUnique) {
      classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Subject.findOne({ classCode });
      if (!existing) isUnique = true;
    }

    subject.classCode = classCode;
    await subject.save();

    res.json({ classCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending enrollments for a subject
router.get('/:id/pending-enrollments', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check authorization
    if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find students with pending enrollments for this subject
    const Student = require('../models/Student');
    const pendingStudents = await Student.find({
      'subjects.subject': id,
      'subjects.isVerified': false,
      isActive: true
    }).select('studentId fullName course year section subjects');

    // Filter to only show the pending enrollment for this subject
    const pendingEnrollments = pendingStudents.map(student => {
      const enrollment = student.subjects.find(
        sub => sub.subject.toString() === id && !sub.isVerified
      );
      return {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.fullName,
          course: student.course,
          year: student.year,
          section: student.section
        },
        enrolledAt: enrollment.enrolledAt
      };
    });

    res.json(pendingEnrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subject by class code (for students)
router.get('/by-code/:classCode', async (req, res) => {
  try {
    const { classCode } = req.params;

    const subject = await Subject.findOne({ 
      classCode: classCode.toUpperCase(), 
      isActive: true 
    })
      .populate('teacher', 'fullName')
      .populate('schoolYear', 'year')
      .select('name code description teacher schoolYear semester classCode');

    if (!subject) {
      return res.status(404).json({ message: 'Invalid class code' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;