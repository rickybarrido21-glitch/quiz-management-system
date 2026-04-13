# Quiz System Setup Instructions

## Prerequisites

### Backend Requirements
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Frontend Requirements
- Node.js (v16 or higher)
- npm or yarn

### Android Requirements
- Android Studio (latest version)
- Android SDK (API level 24 or higher)
- Java 8 or higher

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string
4. Update `.env` file with Atlas connection string

### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/quiz_system
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3001
   ```

5. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. Verify server is running:
   - Open http://localhost:3000/health
   - Should see: `{"status":"OK","timestamp":"..."}`

### 3. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   # Create .env file
   echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open browser to http://localhost:3001

### 4. Android Setup

1. Open Android Studio

2. Open the `android` folder as a project

3. Wait for Gradle sync to complete

4. Update API configuration:
   - Open `android/app/src/main/java/com/quizapp/student/api/ApiClient.java`
   - Update `BASE_URL`:
     ```java
     // For emulator
     private static final String BASE_URL = "http://10.0.2.2:3000/api/";
     
     // For physical device (replace with your computer's IP)
     private static final String BASE_URL = "http://192.168.1.100:3000/api/";
     ```

5. Build and run:
   - Connect Android device or start emulator
   - Click "Run" button in Android Studio

### 5. Initial Data Setup

#### Create Admin User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.edu",
    "password": "admin123",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

#### Create School Year
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "year": "2025-2026",
    "semesters": [
      {
        "name": "First",
        "startDate": "2025-08-15",
        "endDate": "2025-12-15",
        "isActive": true
      },
      {
        "name": "Second",
        "startDate": "2026-01-15",
        "endDate": "2026-05-15",
        "isActive": false
      }
    ]
  }'
```

## Testing the System

### 1. Web Admin Panel
1. Go to http://localhost:3001
2. Login with admin credentials
3. Create school year and subjects
4. Create sample quizzes

### 2. Android App
1. Install app on device/emulator
2. Register as student
3. Join class using class code
4. Take quizzes

### 3. API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Student registration
curl -X POST http://localhost:3000/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "2025001",
    "fullName": "John Doe",
    "course": "Computer Science",
    "year": "3rd",
    "section": "A"
  }'
```

## Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB connection error**: Check if MongoDB is running
- **Port already in use**: Change PORT in .env file
- **JWT errors**: Ensure JWT_SECRET is set in .env

#### Frontend Issues
- **API connection error**: Verify backend is running on correct port
- **CORS errors**: Check CORS_ORIGIN in backend .env

#### Android Issues
- **Network error**: Check API base URL in ApiClient.java
- **Build errors**: Ensure Android SDK is properly installed
- **Emulator connection**: Use 10.0.2.2 for emulator, actual IP for device

### Network Configuration

#### For Physical Android Device
1. Connect device to same WiFi as development machine
2. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```
3. Update ApiClient.java with your IP address
4. Ensure firewall allows connections on port 3000

#### For Production Deployment
1. Deploy backend to cloud service (Heroku, AWS, etc.)
2. Update frontend environment variables
3. Update Android API base URL
4. Configure proper CORS settings

## Security Notes

### Development
- Use strong JWT secrets
- Enable HTTPS in production
- Validate all inputs
- Implement rate limiting

### Production Checklist
- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Security headers

## Performance Optimization

### Backend
- Enable MongoDB indexing
- Implement caching (Redis)
- Use compression middleware
- Optimize database queries

### Frontend
- Build for production: `npm run build`
- Enable gzip compression
- Optimize images and assets
- Implement lazy loading

### Android
- Enable ProGuard for release builds
- Optimize images and resources
- Implement proper caching
- Test on various devices

## Deployment

### Backend Deployment (Heroku Example)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create quiz-system-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret_here
heroku config:set MONGODB_URI=your_mongodb_atlas_uri

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify Example)
```bash
# Build for production
npm run build

# Deploy to Netlify (drag and drop dist folder)
# Or use Netlify CLI
netlify deploy --prod --dir=dist
```

### Android Deployment
1. Generate signed APK in Android Studio
2. Test on multiple devices
3. Upload to Google Play Console (optional)

## Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Test API endpoints individually
4. Verify network connectivity
5. Check database connections

## Next Steps

After basic setup:
1. Customize UI/UX
2. Add more question types
3. Implement advanced analytics
4. Add push notifications
5. Enhance security features
6. Add offline capabilities