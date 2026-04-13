const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz_system');
    console.log('Connected to MongoDB');

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: 'teacher@test.com' });
    if (existingTeacher) {
      console.log('✅ Teacher user already exists');
      return;
    }

    // Create teacher user
    const teacher = new User({
      email: 'teacher@test.com',
      password: 'teacher123',
      fullName: 'Test Teacher',
      role: 'teacher'
    });

    await teacher.save();
    console.log('✅ Teacher user created successfully');
    console.log('Email: teacher@test.com');
    console.log('Password: teacher123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();