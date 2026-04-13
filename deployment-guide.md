# Easy Render Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

The project is now structured to work seamlessly with Render:

```
quiz-system/
├── package.json          # Root package.json (handles both backend & frontend)
├── server.js            # Main server file (serves both API and React app)
├── render.yaml          # Render configuration
├── backend/             # Backend code
├── frontend/            # Frontend code
└── android/             # Android app (not deployed)
```

### 2. Environment Variables Setup

Create a `.env` file in the root directory:

```env
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_long_random_jwt_secret_key_here
NODE_ENV=production
CORS_ORIGIN=https://your-app-name.onrender.com
```

### 3. Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/quiz-system.git
   git push -u origin main
   ```

2. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service:**
   - **Name:** `quiz-management-system`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Set Environment Variables:**
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_long_random_secret`
   - `MONGODB_URI` = `your_mongodb_connection_string`
   - `PORT` = `10000`

#### Option B: Using render.yaml (Automatic)

1. The `render.yaml` file is already configured
2. Just push to GitHub and connect to Render
3. Render will automatically use the configuration

### 4. Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

#### Option B: Render PostgreSQL (Alternative)
If you prefer PostgreSQL, you can modify the models to use Sequelize instead of Mongoose.

### 5. Update Android App

After deployment, update the Android app's API URL:

```java
// In android/app/src/main/java/com/quizapp/student/api/ApiClient.java
private static final String BASE_URL = "https://your-app-name.onrender.com/api/";
```

## 🔧 How This Structure Works

### Single Server Approach
- **Development:** Backend and frontend run separately
- **Production:** Single Node.js server serves both API and React build
- **Benefits:** Easier deployment, no CORS issues, single domain

### Build Process
1. `npm run build` builds the React frontend
2. Express serves static files from `frontend/dist`
3. API routes are handled by `/api/*`
4. All other routes serve the React app (SPA routing)

### File Structure Benefits
```
Root package.json → Handles deployment
server.js → Main entry point
backend/ → API logic (unchanged)
frontend/ → React app (unchanged)
```

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Solution:** Ensure all dependencies are in the root `package.json`

### Issue 2: API Not Found
**Solution:** Check that API routes start with `/api/`

### Issue 3: React Routes Don't Work
**Solution:** The catch-all route `app.get('*')` handles this

### Issue 4: CORS Errors
**Solution:** Not needed anymore since everything is served from same domain

## 📱 Mobile App Configuration

After deployment, update your Android app:

1. **Update API URL:**
   ```java
   private static final String BASE_URL = "https://your-app-name.onrender.com/api/";
   ```

2. **Test Connection:**
   - Build and install APK
   - Test registration and login
   - Verify quiz functionality

## 🎯 Testing Your Deployment

### 1. Backend API Test
```bash
curl https://your-app-name.onrender.com/health
# Should return: {"status":"OK","timestamp":"..."}
```

### 2. Frontend Test
- Visit: `https://your-app-name.onrender.com`
- Should load React admin panel

### 3. Full Flow Test
1. Register admin user via API
2. Login to web panel
3. Create school year and subject
4. Test with Android app

## 🔒 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB connection secured
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] HTTPS enabled (automatic on Render)

## 📊 Performance Tips

### Free Tier Limitations
- App sleeps after 15 minutes of inactivity
- 750 hours/month limit
- Slower cold starts

### Optimization
- Use paid plan for production
- Implement caching
- Optimize database queries
- Compress static assets

## 🆘 Troubleshooting

### Logs Access
```bash
# View logs in Render dashboard
# Or use Render CLI
render logs -s your-service-name
```

### Common Fixes
1. **App won't start:** Check environment variables
2. **Database errors:** Verify MongoDB URI
3. **Build fails:** Check dependencies in package.json
4. **404 errors:** Ensure routes are correct

## 🎉 Success!

Once deployed:
- **Web Admin:** `https://your-app-name.onrender.com`
- **API Base:** `https://your-app-name.onrender.com/api`
- **Health Check:** `https://your-app-name.onrender.com/health`

Your quiz system is now live and ready for use! 🚀