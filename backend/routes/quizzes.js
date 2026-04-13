const express = require('express');
const { body, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const { auth, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all quizzes for a class
router.get('/', auth, async (req, res) => {
  try {
    const { classId } = req.query;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    // Teachers see their own class quizzes; students see active quizzes for enrolled class
    let classData;
    if (req.user.role === 'student') {
      // Verify student is enrolled in this class
      const EnrollmentRequest = require('../models/EnrollmentRequest');
      const enrollment = await EnrollmentRequest.findOne({
        studentId: req.user.userId,
        classId,
        status: 'approved'
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this class' });
      }
      classData = await Class.findById(classId);
    } else {
      classData = await Class.findOne({ _id: classId, teacherId: req.user.userId });
    }

    if (!classData) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    const query = { classId };
    // Students only see active quizzes
    if (req.user.role === 'student') query.isActive = true;

    const quizzes = await Quiz.find(query)
      .populate('teacherId', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate('classId', 'courseCode courseDescription')
      .populate('teacherId', 'fullName email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has access to this quiz
    if (req.user.role === 'teacher' && quiz.teacherId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create quiz
router.post('/', [auth, teacherOrAdmin, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('questions').isArray().isLength({ min: 1 }).withMessage('At least one question is required'),
  body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be at least 1 minute')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      classId, 
      questions, 
      timeLimit, 
      randomizeQuestions, 
      availableFrom, 
      availableUntil 
    } = req.body;

    // Verify class exists and user has access
    const classData = await Class.findOne({ _id: classId, teacherId: req.user.userId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found or access denied' });
    }

    const quiz = new Quiz({
      title,
      description,
      classId,
      teacherId: req.user.userId,
      questions,
      timeLimit: timeLimit || 60,
      randomizeQuestions: randomizeQuestions || false,
      availableFrom: availableFrom || null,
      availableUntil: availableUntil || null
    });

    await quiz.save();
    await quiz.populate('classId', 'courseCode courseDescription');

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update quiz
router.put('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow changing classId or teacherId
    delete updates.classId;
    delete updates.teacherId;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has access to this quiz
    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('classId', 'courseCode courseDescription');

    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle quiz active status
router.patch('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has access to this quiz
    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate quiz has questions before activating
    if (isActive && (!quiz.questions || quiz.questions.length === 0)) {
      return res.status(400).json({ message: 'Cannot activate quiz without questions' });
    }

    quiz.isActive = isActive;
    await quiz.save();

    res.json({ message: `Quiz ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete quiz
router.delete('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has access to this quiz
    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Quiz.findByIdAndDelete(id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;