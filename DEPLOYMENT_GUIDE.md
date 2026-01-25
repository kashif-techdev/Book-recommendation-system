# 🚀 Production Deployment Guide

Complete guide for deploying the Book Recommendation System to production.

## 📋 Deployment Overview

- **Frontend (Next.js)** → **Vercel**
- **Backend (NestJS)** → **Render**
- **ML Services** → **Hugging Face Spaces**
- **Database** → **PostgreSQL** (Render / Supabase / Railway)

---

## 1️⃣ Deploy ML Service (Hugging Face Spaces)

### Step 1: Prepare ML Service

1. Navigate to `ml-services/book-recommendations/`
2. Ensure `books_with_emotions.csv` is in the directory
3. Verify `app.py` and `requirements.txt` are correct

### Step 2: Create Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Configure:
   - **SDK**: Choose "Gradio" or "Docker"
   - **Name**: `book-recommendations` (or your preferred name)
   - **Visibility**: Public or Private
   - **Hardware**: CPU (or GPU if needed)

### Step 3: Upload Files

Upload these files to your Space:
- `app.py`
- `requirements.txt`
- `books_with_emotions.csv` (or use Hugging Face Datasets)

### Step 4: Deploy

1. Hugging Face will automatically build and deploy
2. Wait for deployment to complete
3. Copy your Space URL (e.g., `https://your-username-book-recommendations.hf.space`)

### Step 5: Test ML Service

```bash
# Test the endpoint
curl -X POST https://your-username-book-recommendations.hf.space/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "mystery", "category": "All", "tone": "All", "limit": 10}'
```

---

## 2️⃣ Set Up PostgreSQL Database

### Option A: Render PostgreSQL

1. Go to https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `book-recommendation-db`
   - **Database**: `book_recommendation`
   - **User**: Auto-generated
   - **Region**: Choose closest to your backend
4. Copy the **Internal Database URL**

### Option B: Supabase

1. Go to https://supabase.com
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string**

### Option C: Railway

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy the connection string

---

## 3️⃣ Deploy Backend (Render)

### Step 1: Prepare Repository

1. Ensure `backend-nestjs/` is in your GitHub repository
2. Verify all files are committed

### Step 2: Create Render Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository

### Step 3: Configure Build

- **Name**: `book-recommendation-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend-nestjs && npm install && npm run build`
- **Start Command**: `cd backend-nestjs && npm run start:prod`
- **Root Directory**: Leave empty (or set to `backend-nestjs` if needed)

### Step 4: Set Environment Variables

Add these environment variables in Render:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=book_recommendation

# JWT
JWT_SECRET=your-very-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ML Service
ML_SERVICE_URL=https://your-username-book-recommendations.hf.space

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for build and deployment
3. Copy your backend URL (e.g., `https://book-recommendation-backend.onrender.com`)

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test API docs
# Visit: https://your-backend.onrender.com/api
```

---

## 4️⃣ Deploy Frontend (Vercel)

### Step 1: Prepare Frontend

1. Ensure `frontend/` is in your GitHub repository
2. Update API base URL in `frontend/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

### Step 3: Set Environment Variables

Add these in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_ML_SERVICE_URL=https://your-username-book-recommendations.hf.space
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment
3. Your frontend will be live at `https://your-project.vercel.app`

---

## 5️⃣ Update Google OAuth

### Update Authorized Origins

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://your-frontend.vercel.app`
   - `http://localhost:3000` (for local development)

5. Add to **Authorized redirect URIs**:
   - `https://your-frontend.vercel.app`
   - `http://localhost:3000` (for local development)

---

## 6️⃣ Final Verification

### Test All Endpoints

1. **Health Check**
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **API Documentation**
   - Visit: `https://your-backend.onrender.com/api`

3. **Frontend**
   - Visit: `https://your-frontend.vercel.app`
   - Test login/register
   - Test book search
   - Test search history

### Monitor Logs

- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → View Function Logs
- **Hugging Face**: Space → Logs

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify `DATABASE_URL` is correct
- Check database is accessible from Render
- Ensure SSL is enabled for production

**ML Service Timeout**
- Check ML service URL is correct
- Verify Hugging Face Space is running
- Increase timeout in `ml-integration.service.ts`

### Frontend Issues

**API Connection Error**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend is running

**Authentication Issues**
- Check Google OAuth credentials
- Verify authorized origins are set
- Check JWT_SECRET is set

---

## 📊 Monitoring

### Recommended Tools

1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Error Tracking**: Sentry
3. **Analytics**: Vercel Analytics, Google Analytics

---

## 🔐 Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS everywhere
- [ ] Set secure CORS origins
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database SSL
- [ ] Regular security updates
- [ ] Rate limiting (consider adding)

---

## 📝 Post-Deployment

1. **Test all features**
2. **Monitor performance**
3. **Set up alerts**
4. **Document any custom configurations**
5. **Backup database regularly**

---

## 🎉 Success!

Your Book Recommendation System is now live in production!

- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.onrender.com`
- API Docs: `https://your-backend.onrender.com/api`
- ML Service: `https://your-username-book-recommendations.hf.space`
