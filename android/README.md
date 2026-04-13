# Quiz App - Android Student Application

A modern, secure Android application for students to take quizzes with advanced anti-cheating features.

## 🚀 Features

### 📱 Modern UI/UX
- **Material Design 3** with gradient themes
- **Smooth animations** and transitions
- **Responsive layouts** for all screen sizes
- **Dark/Light theme** support

### 🔐 Security Features
- **Screenshot prevention** during quizzes
- **App switching detection** with violation tracking
- **Secure mode** that prevents task switching
- **Device fingerprinting** for authentication
- **Violation logging** and reporting

### 📚 Quiz Management
- **Real-time quiz taking** with timer
- **Multiple choice questions** with visual feedback
- **Progress tracking** and navigation
- **Auto-submit** when time expires
- **Instant results** with detailed scoring

### 👥 Student Features
- **Easy registration** with student ID
- **Class joining** via class codes
- **Subject management** and organization
- **Leaderboards** and performance tracking
- **Profile management**

## 🛠 Technical Stack

- **Language**: Java
- **UI Framework**: Material Design Components
- **Networking**: Retrofit 2 + OkHttp
- **Architecture**: MVP Pattern
- **Security**: Android Security Library
- **Data Storage**: SharedPreferences + Encrypted Storage

## 📋 Prerequisites

- Android Studio Arctic Fox or later
- Android SDK 24+ (Android 7.0)
- Java 8+
- Backend server running on port 5000

## 🔧 Setup Instructions

### 1. Clone and Setup
```bash
git clone <repository-url>
cd android
```

### 2. Configure Backend URL
Edit `app/src/main/java/com/quizapp/student/api/ApiClient.java`:

For **Android Emulator**:
```java
private static final String BASE_URL = "http://10.0.2.2:5000/api/";
```

For **Physical Device**:
```java
private static final String BASE_URL = "http://YOUR_COMPUTER_IP:5000/api/";
```

### 3. Build the APK

#### Option A: Using Android Studio
1. Open the `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. APK will be generated in `app/build/outputs/apk/debug/`

#### Option B: Using Command Line
```bash
cd android
./gradlew assembleDebug
```

#### Option C: Using Build Script (Windows)
```bash
# From project root
./build-apk.bat
```

## 📱 Installation

### Install on Device
1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging** and **Install unknown apps**
3. Transfer the APK to your device
4. Install the APK

### Install via ADB
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 🔒 Security Features Explained

### Quiz Mode Security
When a quiz starts, the app enters "Quiz Mode" which:
- **Prevents screenshots** and screen recording
- **Blocks app switching** and multitasking
- **Monitors security violations** (max 3 violations)
- **Keeps screen on** to prevent accidental exits
- **Logs all activities** for audit purposes

### Anti-Cheating Measures
- **Device fingerprinting** ensures one device per student
- **Time tracking** monitors question completion times
- **Violation detection** for suspicious behavior
- **Secure submission** with encrypted data transfer

## 📊 App Architecture

```
app/
├── activities/          # UI Activities
│   ├── LoginActivity
│   ├── RegisterActivity
│   ├── MainActivity
│   ├── QuizActivity     # Secure quiz taking
│   ├── ResultActivity
│   └── ProfileActivity
├── adapters/           # RecyclerView Adapters
├── api/               # Network Layer
├── models/            # Data Models
└── utils/             # Utilities
    ├── PreferenceManager
    └── SecurityManager # Security features
```

## 🎨 UI Components

### Login/Register
- **Modern card-based design**
- **Input validation** with real-time feedback
- **Loading states** and error handling
- **Smooth transitions** between screens

### Dashboard
- **Welcome card** with student info
- **Subject grid** with visual icons
- **Empty states** with helpful messages
- **Floating action button** for quick actions

### Quiz Interface
- **Security warning bar** at top
- **Timer with visual countdown**
- **Progress indicator**
- **Question cards** with options
- **Navigation controls**

### Results
- **Celebration animations**
- **Score visualization**
- **Detailed statistics**
- **Action buttons** for next steps

## 🔧 Configuration

### Network Configuration
Update `ApiClient.java` with your backend URL:
```java
// For local development
private static final String BASE_URL = "http://10.0.2.2:5000/api/";

// For production
private static final String BASE_URL = "https://your-domain.com/api/";
```

### Security Settings
Modify `SecurityManager.java` to adjust security levels:
```java
private static final int MAX_VIOLATIONS = 3; // Maximum allowed violations
private static final int SECURITY_CHECK_INTERVAL = 2000; // Check every 2 seconds
```

## 🐛 Troubleshooting

### Common Issues

**1. Network Connection Failed**
- Check if backend server is running
- Verify the API URL in `ApiClient.java`
- Ensure device/emulator can reach the server

**2. APK Build Failed**
- Clean and rebuild: `./gradlew clean assembleDebug`
- Check Android SDK installation
- Verify Java version compatibility

**3. Security Features Not Working**
- Ensure app has necessary permissions
- Test on physical device (some features don't work in emulator)
- Check Android version compatibility (API 24+)

**4. Quiz Not Loading**
- Verify student is enrolled in the subject
- Check quiz availability and timing
- Ensure proper authentication

### Debug Mode
Enable debug logging by setting log level in `ApiClient.java`:
```java
loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
```

## 📈 Performance Optimization

- **Image optimization** with appropriate sizes
- **Network caching** for better offline experience
- **Memory management** for smooth scrolling
- **Battery optimization** during quiz mode

## 🔄 Updates and Maintenance

### Version Updates
1. Update `versionCode` and `versionName` in `build.gradle`
2. Test thoroughly on different devices
3. Generate signed APK for production
4. Distribute through appropriate channels

### Security Updates
- Regularly update security libraries
- Monitor for new Android security features
- Update anti-cheating mechanisms as needed
- Review and update permissions

## 📞 Support

For technical support or bug reports:
1. Check the troubleshooting section above
2. Review application logs
3. Contact the development team with:
   - Device information
   - Android version
   - Steps to reproduce the issue
   - Screenshots (if applicable)

## 📄 License

This project is part of the Quiz Management System. All rights reserved.