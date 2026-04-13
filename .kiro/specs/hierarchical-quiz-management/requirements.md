# Requirements Document

## Introduction

The Hierarchical Quiz Management System is a comprehensive educational platform that enables teachers to organize their academic content in a structured hierarchy (School Year → Semester → Class → Quiz) while providing students with a streamlined mobile experience for joining classes and taking quizzes. The system implements a class code-based enrollment workflow with teacher approval mechanisms and comprehensive quiz management capabilities.

## Glossary

- **Quiz_Management_System**: The complete hierarchical quiz management platform
- **Teacher**: An authenticated user with administrative privileges for creating and managing academic content
- **Student**: A mobile app user who joins classes and takes quizzes
- **School_Year**: A top-level academic period container (e.g., 2025-2026)
- **Semester**: A subdivision of a school year (First, Second, Summer)
- **Class**: A course offering within a semester with specific course details and student enrollment
- **Class_Code**: An auto-generated unique identifier that students use to join classes
- **Quiz**: An assessment containing multiple questions within a specific class
- **Enrollment_Request**: A student's request to join a class using a class code
- **Quiz_Session**: An active instance of a student taking a quiz
- **Leaderboard**: A ranking display of student performance within a class

## Requirements

### Requirement 1: School Year Management

**User Story:** As a teacher, I want to create and manage school years, so that I can organize my academic content by academic periods.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL allow teachers to create school years with academic year format (e.g., 2025-2026)
2. WHEN a teacher creates a school year, THE Quiz_Management_System SHALL validate the year format and prevent duplicate entries
3. THE Quiz_Management_System SHALL display all school years in chronological order for the authenticated teacher
4. THE Quiz_Management_System SHALL allow teachers to edit school year details
5. WHEN a teacher attempts to delete a school year, THE Quiz_Management_System SHALL prevent deletion if semesters exist within it

### Requirement 2: Semester Management

**User Story:** As a teacher, I want to create semesters within school years, so that I can organize classes by academic terms.

#### Acceptance Criteria

1. WHEN a teacher selects a school year, THE Quiz_Management_System SHALL allow creation of semesters within that school year
2. THE Quiz_Management_System SHALL support semester types: First, Second, and Summer
3. THE Quiz_Management_System SHALL prevent duplicate semester types within the same school year
4. THE Quiz_Management_System SHALL display semesters in logical order (First, Second, Summer) within each school year
5. WHEN a teacher attempts to delete a semester, THE Quiz_Management_System SHALL prevent deletion if classes exist within it

### Requirement 3: Class Creation and Management

**User Story:** As a teacher, I want to create classes within semesters with detailed course information, so that I can organize my teaching content and enable student enrollment.

#### Acceptance Criteria

1. WHEN a teacher selects a semester, THE Quiz_Management_System SHALL allow creation of classes within that semester
2. THE Quiz_Management_System SHALL require the following class information: Course Code, Course Description, Year (1st, 2nd, 3rd, 4th, 5th), and Section (A, B, C, etc.)
3. WHEN a class is created, THE Quiz_Management_System SHALL auto-generate a unique Class_Code for student enrollment
4. THE Quiz_Management_System SHALL ensure Class_Code uniqueness across the entire system
5. THE Quiz_Management_System SHALL display the generated Class_Code prominently for teachers to share with students
6. THE Quiz_Management_System SHALL allow teachers to regenerate Class_Code if needed
7. THE Quiz_Management_System SHALL prevent duplicate combinations of Course Code, Year, and Section within the same semester

### Requirement 4: Student Registration and Authentication

**User Story:** As a student, I want to register in the mobile app with my details, so that I can access the quiz system and join classes.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL provide a mobile app registration interface for students
2. THE Quiz_Management_System SHALL require student registration fields: full name, email, student ID, and password
3. WHEN a student registers, THE Quiz_Management_System SHALL validate email format and student ID uniqueness
4. THE Quiz_Management_System SHALL send email verification for new student accounts
5. THE Quiz_Management_System SHALL allow students to login using email and password
6. THE Quiz_Management_System SHALL maintain secure authentication sessions for mobile app users

### Requirement 5: Class Enrollment Workflow

**User Story:** As a student, I want to join classes using class codes, so that I can participate in quizzes for my courses.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL provide a class code input interface in the mobile app
2. WHEN a student enters a valid Class_Code, THE Quiz_Management_System SHALL create an Enrollment_Request
3. THE Quiz_Management_System SHALL display pending enrollment status to the student
4. WHEN a student enters an invalid Class_Code, THE Quiz_Management_System SHALL display an appropriate error message
5. THE Quiz_Management_System SHALL prevent duplicate enrollment requests from the same student for the same class
6. THE Quiz_Management_System SHALL notify teachers of new Enrollment_Request submissions

### Requirement 6: Teacher Student Management

**User Story:** As a teacher, I want to view and manage student enrollment requests, so that I can control who has access to my classes.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL display all pending Enrollment_Request items for each class
2. THE Quiz_Management_System SHALL show student details (name, email, student ID) for each enrollment request
3. THE Quiz_Management_System SHALL allow teachers to approve enrollment requests
4. THE Quiz_Management_System SHALL allow teachers to reject enrollment requests with optional reason
5. WHEN a teacher approves an enrollment request, THE Quiz_Management_System SHALL add the student to the class roster
6. WHEN a teacher rejects an enrollment request, THE Quiz_Management_System SHALL notify the student with the rejection reason
7. THE Quiz_Management_System SHALL allow teachers to remove students from class rosters after enrollment
8. THE Quiz_Management_System SHALL display the complete student list for each class

### Requirement 7: Quiz Creation and Configuration

**User Story:** As a teacher, I want to create quizzes within my classes with various question types and settings, so that I can assess student learning effectively.

#### Acceptance Criteria

1. WHEN a teacher selects a class, THE Quiz_Management_System SHALL allow creation of quizzes within that class
2. THE Quiz_Management_System SHALL support multiple question types: multiple choice, true/false, short answer, and essay
3. THE Quiz_Management_System SHALL allow teachers to set quiz configuration: title, description, time limit, question randomization, and availability dates
4. THE Quiz_Management_System SHALL allow teachers to add, edit, and remove questions from quizzes
5. THE Quiz_Management_System SHALL validate that quizzes contain at least one question before activation
6. THE Quiz_Management_System SHALL allow teachers to preview quizzes before making them available to students
7. THE Quiz_Management_System SHALL support quiz scheduling with start and end dates

### Requirement 8: Student Quiz Taking Experience

**User Story:** As a student, I want to take quizzes within my enrolled classes, so that I can demonstrate my knowledge and receive feedback.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL display available quizzes for each enrolled class in the mobile app
2. WHEN a student starts a quiz, THE Quiz_Management_System SHALL create a Quiz_Session with timestamp tracking
3. WHILE a Quiz_Session is active, THE Quiz_Management_System SHALL display remaining time if a time limit is set
4. THE Quiz_Management_System SHALL prevent students from taking the same quiz multiple times unless explicitly allowed
5. WHEN a student submits a quiz, THE Quiz_Management_System SHALL save all responses and calculate scores automatically for objective questions
6. THE Quiz_Management_System SHALL display immediate results for auto-gradable questions
7. IF a Quiz_Session exceeds the time limit, THEN THE Quiz_Management_System SHALL auto-submit the quiz with current responses

### Requirement 9: Quiz Results and Analytics

**User Story:** As a teacher, I want to monitor quiz results and view analytics, so that I can assess student performance and improve my teaching.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL display quiz results for all students who completed each quiz
2. THE Quiz_Management_System SHALL show individual student responses and scores for each question
3. THE Quiz_Management_System SHALL calculate and display quiz statistics: average score, highest score, lowest score, and completion rate
4. THE Quiz_Management_System SHALL allow teachers to export quiz results in CSV format
5. THE Quiz_Management_System SHALL provide question-level analytics showing which questions were most/least difficult
6. THE Quiz_Management_System SHALL allow teachers to manually grade essay and short answer questions
7. THE Quiz_Management_System SHALL update overall quiz scores when manual grading is completed

### Requirement 10: Student Performance Tracking

**User Story:** As a student, I want to view my quiz scores and class leaderboards, so that I can track my progress and compare my performance.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL display individual quiz scores and feedback for each completed quiz
2. THE Quiz_Management_System SHALL show overall class performance statistics for each enrolled class
3. THE Quiz_Management_System SHALL generate class Leaderboard rankings based on quiz performance
4. WHERE leaderboard display is enabled by the teacher, THE Quiz_Management_System SHALL show student rankings within each class
5. THE Quiz_Management_System SHALL allow students to view their quiz history and progress over time
6. THE Quiz_Management_System SHALL display achievement badges or milestones based on performance criteria

### Requirement 11: Role-Based Access Control

**User Story:** As a system administrator, I want to ensure proper access control between teachers and students, so that data security and privacy are maintained.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL restrict school year, semester, and class management functions to authenticated teachers only
2. THE Quiz_Management_System SHALL prevent students from accessing teacher administrative interfaces
3. THE Quiz_Management_System SHALL ensure students can only view and interact with classes they are enrolled in
4. THE Quiz_Management_System SHALL prevent students from viewing other students' individual quiz responses
5. THE Quiz_Management_System SHALL allow teachers to access only their own created content and enrolled students
6. THE Quiz_Management_System SHALL maintain audit logs of all administrative actions performed by teachers

### Requirement 12: Data Persistence and Integrity

**User Story:** As a system user, I want my data to be reliably stored and maintained, so that I don't lose important academic information.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL persist all hierarchical data (school years, semesters, classes, quizzes) in MongoDB database
2. THE Quiz_Management_System SHALL maintain referential integrity between hierarchical levels
3. WHEN cascade deletion is performed, THE Quiz_Management_System SHALL warn users about dependent data that will be removed
4. THE Quiz_Management_System SHALL backup quiz responses immediately upon submission
5. THE Quiz_Management_System SHALL implement database transactions for critical operations like enrollment approval and quiz submission
6. THE Quiz_Management_System SHALL validate data consistency during all create, update, and delete operations

### Requirement 13: Mobile App Integration

**User Story:** As a student, I want a responsive mobile app experience, so that I can easily access quizzes and manage my enrollment on my mobile device.

#### Acceptance Criteria

1. THE Quiz_Management_System SHALL provide a responsive mobile interface optimized for Android devices
2. THE Quiz_Management_System SHALL maintain consistent API communication between mobile app and backend services
3. THE Quiz_Management_System SHALL handle network connectivity issues gracefully with appropriate error messages
4. THE Quiz_Management_System SHALL cache essential data locally to enable offline viewing of completed quizzes
5. THE Quiz_Management_System SHALL synchronize data when network connectivity is restored
6. THE Quiz_Management_System SHALL provide push notifications for important events like quiz availability and enrollment status updates