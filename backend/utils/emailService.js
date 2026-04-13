const nodemailer = require('nodemailer');

// Create transporter (using console for development, can be configured for production)
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development: log emails to console
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
};

const sendVerificationEmail = async (email, fullName, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@quizapp.com',
      to: email,
      subject: 'Verify Your Email - Quiz Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Quiz Management System!</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering as a student. Please verify your email address by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Quiz Management System</p>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } else {
      // Development: log email content
      console.log('\n=== EMAIL VERIFICATION (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('===============================================\n');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

const sendEnrollmentNotification = async (teacherEmail, studentName, className) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@quizapp.com',
      to: teacherEmail,
      subject: 'New Student Enrollment Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Enrollment Request</h2>
          <p>A student has requested to join your class:</p>
          <ul>
            <li><strong>Student:</strong> ${studentName}</li>
            <li><strong>Class:</strong> ${className}</li>
          </ul>
          <p>Please log in to your teacher dashboard to approve or reject this request.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      `
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
      console.log(`Enrollment notification sent to ${teacherEmail}`);
    } else {
      console.log('\n=== ENROLLMENT NOTIFICATION (Development Mode) ===');
      console.log(`To: ${teacherEmail}`);
      console.log(`Student: ${studentName} requested to join ${className}`);
      console.log('================================================\n');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending enrollment notification:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendEnrollmentNotification
};