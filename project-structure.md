# Quiz Application System

## Project Overview
- **Student App**: Native Android (Java) - Quiz taking, score monitoring
- **Admin/Teacher Web App**: Node.js - Quiz management, content control
- **Database**: MongoDB
- **Architecture**: Client-Server with REST API

## Core Features

### Student App (Android)
- Student registration (fullname, course, year, section, student ID)
- Class code entry system
- Quiz taking with multiple question types
- Score monitoring and history
- Leaderboard
- Security features (no screenshots, can't close app during quiz)

### Admin/Teacher Web App (Node.js)
- School year management (e.g., 2025-2026)
- Semester management (First, Second, Summer)
- Subject management
- Teacher-subject assignment
- Quiz creation with multiple question types
- Student verification for class codes
- Analytics and reporting

### Database Structure (MongoDB)
- Schools/Years
- Semesters
- Subjects
- Teachers
- Students
- Quizzes
- Quiz Results
- Class Codes

## Question Types Supported
- Multiple Choice
- True/False
- Fill in the Blank
- Other custom types

## Quiz Features
- Timer per quiz
- Randomized questions
- Shuffled choices
- Security controls