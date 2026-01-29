# 🚀 Production Deployment Guide

Complete guide for deploying the Book Recommendation System to production.

## 📋 Deployment Overview

| Component | Platform |
|-----------|----------|
| **Frontend (Next.js)** | Vercel |
| **Backend (NestJS)** | Render |
| **ML Services** | Hugging Face Spaces |
| **Database** | PostgreSQL (Render / Supabase / Railway) |

### Recommended deployment order

1. **ML Service** (Hugging Face) — so backend can call it.
2. **PostgreSQL** (Render or other) — so backend can connect.
3. **Backend** (Render) — connect DB + ML URL.
4. **Frontend** (Vercel) — set API URL to backend.
5. **Google OAuth** — add production origins/redirects.

---
## 1️⃣ Deploy ML Service (Hugging Face Spaces)

The ML service is a **FastAPI-only** API (no Gradio UI). It uses **pandas/numpy** for semantic book search (string matching and scoring), not deep learning models.

### Do I need a GPU?

**No. Use CPU only.**  
This service does not run neural networks or heavy ML inference. Recommendations are computed with pandas/numpy over a CSV dataset. **CPU basic** on Hugging Face is sufficient and keeps the Space free or low-cost. Do not select a GPU tier.

---

### Step 1: Prepare ML Service

1. Navigate to `ml-services/book-recommendations/`
2. Ensure these files are present:
   - `Dockerfile`
   - `app.py`
   - `requirements.txt`
   - `books_with_emotions.csv`

### Step 2: Create Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Configure:
   - **SDK**: **Docker** (required — this is an API-only FastAPI app, not a Gradio app)
   - **Name**: `book-recommendations` (or your preferred name)
   - **Visibility**: Public or Private
   - **Hardware**: **CPU basic** — no GPU needed

### Step 3: Upload Files

Upload **all** of these files to the root of your Space (so the Dockerfile is at the root):

| File | Purpose |
|------|--------|
| `Dockerfile` | Tells Hugging Face how to build and run the container (Python 3.11, uvicorn on port 7860) |
| `app.py` | FastAPI application |
| `requirements.txt` | Python dependencies (fastapi, uvicorn, pandas, numpy, etc.) |
| `books_with_emotions.csv` | Book dataset (required at runtime) |

You can upload via the Space’s **Files** tab or by pushing to a repo connected to the Space.

### Step 4: Deploy

1. Hugging Face builds the image from your `Dockerfile` and deploys the Space.
2. Wait for the build to finish (check the **Logs** tab).
3. Copy your Space URL (e.g. `https://your-username-book-recommendations.hf.space`).

The app listens on **port 7860** (Hugging Face expects this for Docker Spaces).

### Step 5: Test ML Service

```bash
# Health check
curl https://kashifkhaan-book-recommendations.hf.space/health

# Recommendations (POST)
curl -X POST https://kashifkhaan-book-recommendations.hf.space/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "mystery", "category": "All", "tone": "All", "limit": 10}'
```

---

## 2️⃣ Set Up PostgreSQL Database (Do This First)

Create the database **before** deploying the backend so you can link it or copy the URL.

### Option A: Render PostgreSQL (recommended when using Render for backend)

1. Go to https://render.com → **Dashboard**
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `book-recommendation-db`
   - **Database**: `book_recommendation`
   - **User**: (auto-generated)
   - **Region**: Same as your backend (e.g. **Oregon (US West)** or **Frankfurt (EU Central)**)
   - **Plan**: Free or Starter
4. Click **"Create Database"**
5. When ready, open the DB → **Info** tab:
   - Copy **Internal Database URL** (use this for the backend on Render; format: `postgresql://user:password@hostname:5432/dbname`)

The backend supports **DATABASE_URL** (single connection string). If you use another provider, you can set **DB_HOST**, **DB_PORT**, **DB_USERNAME**, **DB_PASSWORD**, **DB_DATABASE** instead.

### Option B: Supabase

1. Go to https://supabase.com → create a project
2. **Settings** → **Database** → **Connection string** (URI)
3. Use that as **DATABASE_URL**, or copy host/port/user/password/database into **DB_*** env vars

### Option C: Railway

1. Go to https://railway.app → new project → add **PostgreSQL**
2. Copy the connection URL and set **DATABASE_URL** (or **DB_***) in your backend env

---

## 3️⃣ Deploy Backend (NestJS) on Render

**Order:** Deploy backend **after** the database is created so you can set **DATABASE_URL** (or **DB_***) from the DB dashboard.

### Step 1: Prepare repository

1. Push `backend-nestjs/` to your GitHub repository (monorepo root = repo root).
2. Ensure `backend-nestjs/package.json`, `backend-nestjs/src/`, and `backend-nestjs/tsconfig.json` are committed.

### Step 2: Create Web Service on Render

1. Go to https://render.com → **Dashboard**
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub** account if needed, then **select the repository** that contains `backend-nestjs/`.
4. Click **"Connect"** (not "Create Web Service" yet — configure first).

### Step 3: Configure build & deploy (important for monorepo)

| Setting | Value |
|--------|--------|
| **Name** | `book-recommendation-backend` (or any name) |
| **Region** | Same as your PostgreSQL (e.g. Oregon or Frankfurt) |
| **Root Directory** | `backend-nestjs` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |

- **Root Directory** must be `backend-nestjs` so Render runs all commands inside that folder and only redeploys when files there change.
- **Do not set PORT** — Render sets `PORT` automatically; the app uses `process.env.PORT || 3000`.

### Step 4: Set environment variables

In the same **Create Web Service** (or later **Environment** tab), add:

| Key | Value | Required |
|-----|--------|----------|
| **DATABASE_URL** | `postgresql://user:password@host:5432/book_recommendation` (from Render PostgreSQL **Internal** URL) | Yes (or use DB_* below) |
| **NODE_ENV** | `production` | Yes |
| **JWT_SECRET** | A long random string (e.g. 32+ chars) | Yes |
| **JWT_EXPIRES_IN** | `7d` | Optional |
| **ML_SERVICE_URL** | `https://kashifkhaan-book-recommendations.hf.space` (your Hugging Face Space) | Yes |
| **CORS_ORIGIN** | `https://your-frontend.vercel.app` (or `*` for testing) | Yes |
| **GOOGLE_CLIENT_ID** | Your Google OAuth client ID | If using Google login |
| **GOOGLE_CLIENT_SECRET** | Your Google OAuth client secret | If using Google login |

**Database:** If you use **Render PostgreSQL**, paste the **Internal Database URL** as **DATABASE_URL** and leave **DB_HOST**, **DB_PORT**, etc. unset.  
If you use another provider without a single URL, set **DB_HOST**, **DB_PORT**, **DB_USERNAME**, **DB_PASSWORD**, **DB_DATABASE** instead.

### Step 5: Instance and health check (optional)

- **Instance Type**: Free or Starter (Free tier spins down after inactivity; first request may be slow.)
- **Health Check Path** (if available): `/health` — Render can use this to confirm the app is up.

### Step 6: Deploy

1. Click **"Create Web Service"**.
2. Wait for the build (install + `npm run build`) and deploy.
3. Copy your service URL (e.g. `https://book-recommendation-backend.onrender.com`).

### Step 7: Verify deployment

```bash
# Health (API + ML service status)
curl https://your-backend.onrender.com/health

# API docs (Swagger)
# Open in browser: https://your-backend.onrender.com/api
```

If **health** returns `mlService: "unhealthy"`, check **ML_SERVICE_URL** and that the Hugging Face Space is running. If the app fails to start, check **Logs** in Render for DB connection or env errors.

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
- Check ML service URL is correct (no trailing slash)
- Verify Hugging Face Space is running (free CPU Spaces may sleep; first request can be slow)
- Increase timeout in `ml-integration.service.ts` if needed
- Use **CPU basic** hardware; GPU is not required for this service

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
