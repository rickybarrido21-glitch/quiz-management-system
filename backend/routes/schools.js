const express = require('express');
const { body, validationResult } = require('express-validator');
const SchoolYear = require('../models/School');
const { auth, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all school years for the authenticated teacher
router.get('/', auth, async (req, res) => {
  try {
    const schoolYears = await SchoolYear.find({ teacherId: req.user.userId })
      .sort({ year: -1 });
    res.json(schoolYears);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get school year by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolYear = await SchoolYear.findOne({ _id: id, teacherId: req.user.userId });
    
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }
    
    res.json(schoolYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create school year
router.post('/', [auth, teacherOrAdmin, [
  body('year').matches(/^\d{4}-\d{4}$/).withMessage('Year must be in format YYYY-YYYY'),
  body('semesters').optional().isArray().withMessage('Semesters must be an array if provided')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, semesters = [] } = req.body;

    // Validate year format (second year should be first year + 1)
    const [startYear, endYear] = year.split('-').map(Number);
    if (endYear !== startYear + 1) {
      return res.status(400).json({ message: 'End year must be exactly one year after start year' });
    }

    // Check if school year already exists for this teacher
    const existingYear = await SchoolYear.findOne({ teacherId: req.user.userId, year });
    if (existingYear) {
      return res.status(400).json({ message: 'School year already exists' });
    }

    const schoolYear = new SchoolYear({
      teacherId: req.user.userId,
      year,
      semesters
    });

    await schoolYear.save();
    res.status(201).json(schoolYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update school year
router.put('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schoolYear = await SchoolYear.findOne({ _id: id, teacherId: req.user.userId });
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    Object.assign(schoolYear, updates);
    await schoolYear.save();

    res.json(schoolYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete school year
router.delete('/:id', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const schoolYear = await SchoolYear.findOne({ _id: id, teacherId: req.user.userId });
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    // Check if there are any classes associated with this school year
    const Class = require('../models/Class');
    const classCount = await Class.countDocuments({ schoolYearId: id });
    if (classCount > 0) {
      return res.status(400).json({ message: 'Cannot delete school year with existing classes' });
    }

    await SchoolYear.findByIdAndDelete(id);
    res.json({ message: 'School year deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set active school year
router.patch('/:id/activate', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate all school years for this teacher
    await SchoolYear.updateMany({ teacherId: req.user.userId }, { isActive: false });

    // Activate selected school year
    const schoolYear = await SchoolYear.findOneAndUpdate(
      { _id: id, teacherId: req.user.userId },
      { isActive: true },
      { new: true }
    );

    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    res.json(schoolYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get active school year for the authenticated teacher
router.get('/active', auth, async (req, res) => {
  try {
    const activeYear = await SchoolYear.findOne({ teacherId: req.user.userId, isActive: true });
    if (!activeYear) {
      return res.status(404).json({ message: 'No active school year found' });
    }
    res.json(activeYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add semester to school year
router.post('/:id/semesters', [auth, teacherOrAdmin, [
  body('name').isIn(['First', 'Second', 'Summer']).withMessage('Semester name must be First, Second, or Summer')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name } = req.body;

    const schoolYear = await SchoolYear.findOne({ _id: id, teacherId: req.user.userId });
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    // Check if semester already exists
    const existingSemester = schoolYear.semesters.find(s => s.name === name);
    if (existingSemester) {
      return res.status(400).json({ message: 'Semester already exists' });
    }

    // Add semester
    schoolYear.semesters.push({
      name,
      startDate: new Date(),
      endDate: new Date(),
      isActive: false
    });

    await schoolYear.save();
    res.status(201).json(schoolYear);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete semester from school year
router.delete('/:schoolYearId/semesters/:semesterId', [auth, teacherOrAdmin], async (req, res) => {
  try {
    const { schoolYearId, semesterId } = req.params;

    const schoolYear = await SchoolYear.findOne({ _id: schoolYearId, teacherId: req.user.userId });
    if (!schoolYear) {
      return res.status(404).json({ message: 'School year not found' });
    }

    // Remove semester
    schoolYear.semesters = schoolYear.semesters.filter(s => s._id.toString() !== semesterId);
    await schoolYear.save();

    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;