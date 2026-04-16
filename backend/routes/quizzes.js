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
        // Log for debugging
        console.log(`Student ${req.user.userId} not enrolled in class ${classId}`);
        const allEnrollments = await EnrollmentRequest.find({ studentId: req.user.userId });
        console.log(`Student enrollments:`, allEnrollments.map(e => ({ classId: e.classId, status: e.status })));
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
    // Remove isActive filter - let students see all quizzes in their enrolled class
    // Teachers can see all, students can see all quizzes for their class

    const quizzes = await Quiz.find(query)
      .populate('teacherId', 'fullName email')
      .sort({ createdAt: -1 });

    // Transform for Android: convert options String[] -> {text}[], add settings wrapper
    const transformed = quizzes.map(q => {
      const obj = q.toObject();
      obj.settings = {
        timeLimit: obj.timeLimit || 15,
        randomizeQuestions: obj.randomizeQuestions || false
      };
      if (Array.isArray(obj.questions)) {
        obj.questions = obj.questions.map(question => {
          if (Array.isArray(question.options) && question.options.length > 0 && typeof question.options[0] === 'string') {
            question.options = question.options.map(text => ({ text }));
          }
          return question;
        });
      }
      return obj;
    });

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz for taking (student) — returns quiz without correct answers, shaped for Android
router.get('/:id/take', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate('classId', 'courseCode courseDescription')
      .populate('teacherId', 'fullName email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      return res.status(403).json({ message: 'This quiz is not currently active' });
    }

    // Build Android-compatible quiz shape
    const quizObj = quiz.toObject();

    // Wrap timeLimit into a settings object (Android model expects settings.timeLimit)
    quizObj.settings = {
      timeLimit: quizObj.timeLimit || 15,
      randomizeQuestions: quizObj.randomizeQuestions || false
    };

    // Transform questions: convert options from String[] to {text, isCorrect}[]
    // and strip correctAnswer so students can't see answers
    quizObj.questions = quizObj.questions.map(q => {
      const { correctAnswer, ...rest } = q;
      if (Array.isArray(rest.options) && rest.options.length > 0 && typeof rest.options[0] === 'string') {
        rest.options = rest.options.map(text => ({ text }));
      }
      return rest;
    });

    res.json({ quiz: quizObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz answers (student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, answers, timeSpent, deviceInfo } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const Student = require('../models/Student');
    const QuizResult = require('../models/QuizResult');

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for duplicate submission
    const existing = await QuizResult.findOne({ quiz: id, student: student._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Grade answers
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const question of quiz.questions) {
      totalPoints += question.points || 1;
      const submitted = answers.find(a => a.questionId === question._id.toString());

      let isCorrect = false;
      if (submitted && submitted.answer !== undefined && submitted.answer !== '') {
        const submittedAnswer = String(submitted.answer).trim();
        const correctAnswer = String(question.correctAnswer || '').trim();

        // Handle index-based answers (Android sends option index as string)
        if (/^\d+$/.test(submittedAnswer) && Array.isArray(question.options)) {
          const idx = parseInt(submittedAnswer, 10);
          const selectedText = question.options[idx];
          isCorrect = selectedText !== undefined &&
            selectedText.toLowerCase() === correctAnswer.toLowerCase();
        } else {
          isCorrect = submittedAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }
      }

      const points = isCorrect ? (question.points || 1) : 0;
      score += points;

      gradedAnswers.push({
        questionId: question._id,
        answer: submitted ? submitted.answer : '',
        isCorrect,
        points,
        timeSpent: submitted ? submitted.timeSpent : 0
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

    const result = new QuizResult({
      quiz: id,
      student: student._id,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      timeSpent: timeSpent || 0,
      startedAt: new Date(Date.now() - (timeSpent || 0) * 1000),
      completedAt: new Date(),
      deviceInfo: deviceInfo || {}
    });

    await result.save();

    res.json({
      message: 'Quiz submitted successfully',
      result: {
        _id: result._id,
        score,
        totalPoints,
        percentage: Math.round(percentage * 100) / 100,
        timeSpent: result.timeSpent,
        completedAt: result.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz results for a specific quiz (teacher/admin)
router.get('/:id/results', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const QuizResult = require('../models/QuizResult');
    const Student = require('../models/Student');

    const quiz = await Quiz.findById(id).populate('classId', 'courseCode courseDescription');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Teachers can only see results for their own quizzes
    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await QuizResult.find({ quiz: id })
      .populate('student', 'studentId fullName course year section email')
      .sort({ completedAt: -1 });

    // Map to frontend-expected shape
    const mapped = results.map(r => ({
      _id: r._id,
      studentId: r.student,
      totalScore: r.score,
      maxScore: r.totalPoints,
      percentage: r.percentage,
      status: 'submitted',
      submittedAt: r.completedAt,
      timeTaken: r.timeSpent
    }));

    res.json({ quiz, results: mapped });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz statistics (teacher/admin)
router.get('/:id/statistics', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const QuizResult = require('../models/QuizResult');

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await QuizResult.find({ quiz: id });

    if (results.length === 0) {
      return res.json({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      });
    }

    const percentages = results.map(r => r.percentage);
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    const passCount = percentages.filter(p => p >= 60).length;

    res.json({
      totalSubmissions: results.length,
      averageScore: Math.round(avg * 100) / 100,
      highestScore: Math.round(Math.max(...percentages) * 100) / 100,
      lowestScore: Math.round(Math.min(...percentages) * 100) / 100,
      passRate: Math.round((passCount / results.length) * 100 * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export quiz results as CSV (teacher/admin)
router.get('/:id/export', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const QuizResult = require('../models/QuizResult');

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.user.role === 'teacher' && quiz.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const results = await QuizResult.find({ quiz: id })
      .populate('student', 'studentId fullName course year section');

    const header = 'Student ID,Full Name,Course,Year,Section,Score,Total Points,Percentage,Time Spent (s),Submitted At\n';
    const rows = results.map(r => {
      const s = r.student || {};
      return [
        s.studentId || '',
        `"${(s.fullName || '').replace(/"/g, '""')}"`,
        s.course || '',
        s.year || '',
        s.section || '',
        r.score,
        r.totalPoints,
        r.percentage.toFixed(2),
        r.timeSpent,
        r.completedAt ? r.completedAt.toISOString() : ''
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${quiz.title}_results.csv"`);
    res.send(header + rows);
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