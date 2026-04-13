# Quiz Management System

A comprehensive quiz application system with Android student app and web-based admin panel.

## System Architecture

### Student App (Android - Java)
- Native Android application for students
- Quiz taking with multiple question types
- Score monitoring and history
- Leaderboard functionality
- Security features (no screenshots, app lock during quiz)

### Admin/Teacher Web App (React + Node.js)
- Web-based management system
- School year and semester management
- Subject and quiz creation
- Student verification and monitoring
- Analytics and reporting

### Database (MongoDB)
- Hierarchical structure: School Years → Semesters → Subjects → Quizzes
- Student management and enrollment
- Quiz results and analytics

## Features

### Core Functionality
- **Hierarchical Organization**: School Years (2025-2026) → Semesters (First, Second, Summer) → Subjects
- **Class Code System**: Like Google Classroom, students join using class codes
- **Teacher Verification**: Teachers verify student enrollment requests
- **Multiple Question Types**: Multiple choice, True/False, Fill in the blank, Essay
- **Quiz Security**: Timer, randomized questions, shuffled choices, screenshot prevention

### Student Features
- Registration with student details (ID, course, year, section)
- Join classes using class codes
- Take quizzes with security controls
- View scores and history
- Leaderboard participation

### Teacher/Admin Features
- Create and manage school years/semesters
- Create subjects and generate class codes
- Build quizzes with various question types
- Verify student enrollments
- Monitor quiz results and analytics

## Project Structure

```
quiz-system/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   └── server.js           # Main server file
├── frontend/               # React admin web app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── package.json
├── android/                # Android student app
│   ├── app/src/main/java/  # Java source code
│   │   └── com/quizapp/student/
│   │       ├── activities/ # Android activities
│   │       ├── models/     # Data models
│   │       ├── utils/      # Utility classes
│   │       └── api/        # API integration
│   └── app/build.gradle
└── README.md
```

## Getting Started

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start MongoDB service
5. Run server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Android Setup
1. Open `android` folder in Android Studio
2. Sync project with Gradle files
3. Update API base URL in `ApiClient.java`
4. Build and run on device/emulator

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register teacher/admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### School Management
- `GET /api/schools` - Get all school years
- `POST /api/schools` - Create school year
- `PATCH /api/schools/:id/activate` - Set active school year

### Subjects
- `GET /api/subjects` - Get subjects
- `POST /api/subjects` - Create subject
- `POST /api/subjects/join` - Join subject with class code

### Quizzes
- `GET /api/quizzes` - Get quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id/take` - Get quiz for taking
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Students
- `POST /api/students/register` - Student registration
- `GET /api/students/:id` - Get student profile
- `POST /api/students/verify` - Verify student enrollment

## Security Features

### Android App Security
- Screenshot prevention during quizzes
- App lock mechanism (can't switch apps during quiz)
- Device ID tracking
- Secure API communication

### Web App Security
- JWT authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting

## Database Schema

### Key Collections
- **SchoolYears**: Academic years with semesters
- **Users**: Teachers and admins
- **Subjects**: Courses with class codes
- **Students**: Student profiles and enrollments
- **Quizzes**: Quiz definitions and settings
- **QuizResults**: Student quiz attempts and scores

## Development Notes

### Quiz Security Implementation
- Timer enforcement on both client and server
- Question randomization per student
- Answer choice shuffling
- Screenshot detection and prevention
- App switching detection

### Leaderboard System
- Real-time score updates
- Subject-wise rankings
- Overall performance metrics
- Privacy controls

## Deployment

### Backend Deployment
- Deploy to cloud service (AWS, Heroku, etc.)
- Configure MongoDB Atlas or self-hosted MongoDB
- Set environment variables
- Enable HTTPS

### Frontend Deployment
- Build production version: `npm run build`
- Deploy to static hosting (Netlify, Vercel, etc.)
- Configure API base URL

### Android Deployment
- Generate signed APK
- Test on multiple devices
- Distribute through internal channels or Play Store

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request

## License

This project is licensed under the MIT License."# quiz-management-system" 
