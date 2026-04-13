const express = require('express');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');
const Student = require('../models/Student');
const { auth, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all quiz results (teacher/admin)
router.get('/', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      quizId, 
      subjectId, 
      studentId,
      minScore,
      maxScore 
    } = req.query;

    let query = {};

    // Build query based on filters
    if (quizId) query.quiz = quizId;
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) query.student = student._id;
    }

    // If teacher, only show results for their quizzes
    if (req.user.role === 'teacher') {
      const teacherQuizzes = await Quiz.find({ teacher: req.user.userId }).select('_id');
      query.quiz = { $in: teacherQuizzes.map(q => q._id) };
    }

    // Score range filter
    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = parseInt(minScore);
      if (maxScore) query.score.$lte = parseInt(maxScore);
    }

    const results = await QuizResult.find(query)
      .populate({
        path: 'quiz',
        select: 'title subject',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .populate('student', 'studentId fullName course year section')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ completedAt: -1 });

    // Filter by subject if specified
    let filteredResults = results;
    if (subjectId) {
      filteredResults = results.filter(result => 
        result.quiz.subject._id.toString() === subjectId
      );
    }

    const total = await QuizResult.countDocuments(query);

    res.json({
      results: filteredResults,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed result by ID
router.get('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const result = await QuizResult.findById(id)
      .populate({
        path: 'quiz',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .populate('student', 'studentId fullName course year section');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Check authorization
    if (req.user.role === 'teacher' && result.quiz.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's quiz history
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const results = await QuizResult.find({ student: student._id })
      .populate({
        path: 'quiz',
        select: 'title subject settings',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ completedAt: -1 });

    const total = await QuizResult.countDocuments({ student: student._id });

    res.json({
      results,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics/statistics
router.get('/analytics/overview', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { subjectId, quizId, startDate, endDate } = req.query;

    let matchQuery = {};

    // Date range filter
    if (startDate || endDate) {
      matchQuery.completedAt = {};
      if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
    }

    // If teacher, only their quizzes
    if (req.user.role === 'teacher') {
      const teacherQuizzes = await Quiz.find({ teacher: req.user.userId }).select('_id');
      matchQuery.quiz = { $in: teacherQuizzes.map(q => q._id) };
    }

    // Subject filter
    if (subjectId) {
      const subjectQuizzes = await Quiz.find({ subject: subjectId }).select('_id');
      matchQuery.quiz = { $in: subjectQuizzes.map(q => q._id) };
    }

    // Quiz filter
    if (quizId) {
      matchQuery.quiz = quizId;
    }

    const analytics = await QuizResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          averageTimeSpent: { $avg: '$timeSpent' },
          highestScore: { $max: '$score' },
          lowestScore: { $min: '$score' },
          passCount: {
            $sum: {
              $cond: [{ $gte: ['$percentage', 60] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Score distribution
    const scoreDistribution = await QuizResult.aggregate([
      { $match: matchQuery },
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Top performers
    const topPerformers = await QuizResult.find(matchQuery)
      .populate('student', 'studentId fullName course year section')
      .sort({ percentage: -1, completedAt: 1 })
      .limit(10);

    const result = {
      overview: analytics[0] || {
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        averageTimeSpent: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0
      },
      scoreDistribution,
      topPerformers
    };

    // Calculate pass rate
    if (result.overview.totalAttempts > 0) {
      result.overview.passRate = (result.overview.passCount / result.overview.totalAttempts) * 100;
    } else {
      result.overview.passRate = 0;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard across all quizzes or specific subject
router.get('/leaderboard/global', async (req, res) => {
  try {
    const { subjectId, limit = 20 } = req.query;

    let matchQuery = {};
    
    if (subjectId) {
      const subjectQuizzes = await Quiz.find({ subject: subjectId }).select('_id');
      matchQuery.quiz = { $in: subjectQuizzes.map(q => q._id) };
    }

    const leaderboard = await QuizResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$student',
          totalScore: { $sum: '$score' },
          totalPossible: { $sum: '$totalPoints' },
          averagePercentage: { $avg: '$percentage' },
          quizzesTaken: { $sum: 1 },
          bestScore: { $max: '$percentage' }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          student: {
            studentId: '$student.studentId',
            fullName: '$student.fullName',
            course: '$student.course',
            year: '$student.year',
            section: '$student.section'
          },
          totalScore: 1,
          totalPossible: 1,
          averagePercentage: { $round: ['$averagePercentage', 2] },
          quizzesTaken: 1,
          bestScore: { $round: ['$bestScore', 2] }
        }
      },
      { $sort: { averagePercentage: -1, totalScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;