const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a student token
    if (decoded.role === 'student') {
      const student = await Student.findById(decoded.userId);
      if (!student || !student.isActive) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      req.user = decoded;
      req.userDoc = student;
      return next();
    }

    // Otherwise check User model (teachers/admins)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = decoded;
    req.userDoc = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Teacher or Admin middleware
const teacherOrAdmin = (req, res, next) => {
  if (!['admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Teacher or Admin access required' });
  }
  next();
};

module.exports = { auth, adminOnly, teacherOrAdmin };