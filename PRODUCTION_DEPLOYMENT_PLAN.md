# 🚀 Production Deployment Plan

## 📋 Overview

This document outlines the complete plan to make the Book Recommendation System production-ready with:
- **Frontend (Next.js)** → Deploy on **Vercel**
- **Backend (NestJS)** → Deploy on **Render**
- **ML Services** → Deploy on **Hugging Face Spaces**

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Vercel        │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────────────────────┐
│   Backend API (NestJS)          │
│   Render                        │
│                                 │
│  ┌────────────┐  ┌──────────┐  │
│  │ PostgreSQL │  │ Auth/JWT │  │
│  │ Database   │  │ Services │  │
│  └────────────┘  └──────────┘  │
└────────┬────────────────────────┘
         │
         │ API Calls
         │
┌────────▼────────────────────────┐
│   ML Services                   │
│   Hugging Face Spaces           │
│                                 │
│  - Book Recommendations         │
│  - Semantic Search              │
│  - Emotion Analysis             │
└─────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 14+ (App Router)
- **Deployment**: Vercel
- **State Management**: React Context / Zustand
- **API Client**: Axios / Fetch

### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM / Prisma
- **Authentication**: JWT (Passport.js)
- **Deployment**: Render
- **API Documentation**: Swagger/OpenAPI

### ML Services
- **Platform**: Hugging Face Spaces
- **Framework**:  FastAPI
- **Models**: 
  - Sentence Transformers (embeddings)
  - Emotion Analysis
  - Book Recommendations

### Database
- **Production**: PostgreSQL (Render / Supabase / Railway)
- **Development**: PostgreSQL (local or Docker)

---

## 🗂️ Project Structure

```
book-recommendation-system/
├── frontend/                    # Next.js (existing)
│   ├── app/
│   ├── components/
│   └── lib/
│
├── backend/                     # NestJS (new)
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   └── database.config.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── books/
│   │   │   ├── books.module.ts
│   │   │   ├── books.controller.ts
│   │   │   └── books.service.ts
│   │   ├── search-history/
│   │   │   ├── search-history.module.ts
│   │   │   ├── search-history.controller.ts
│   │   │   ├── search-history.service.ts
│   │   │   └── entities/
│   │   │       └── search-history.entity.ts
│   │   └── ml-integration/
│   │       ├── ml-integration.module.ts
│   │       ├── ml-integration.service.ts
│   │       └── interfaces/
│   │           └── ml-service.interface.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── ml-services/                  # Hugging Face (new)
│   ├── book-recommendations/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── README.md
│   └── README.md
│
└── docs/
    ├── DEPLOYMENT.md
    └── ARCHITECTURE.md
```

---

## 🔄 Migration Steps

### Phase 1: Setup NestJS Backend

1. **Initialize NestJS Project**
   ```bash
   npm i -g @nestjs/cli
   nest new backend-nestjs
   ```

2. **Install Dependencies**
   - TypeORM + PostgreSQL driver
   - Passport + JWT
   - Swagger
   - Config module
   - Validation

3. **Configure Database**
   - PostgreSQL connection
   - TypeORM entities
   - Migrations

### Phase 2: Migrate Features

1. **Authentication Module**
   - User registration/login
   - JWT tokens
   - Google OAuth
   - Password hashing

2. **Users Module**
   - User CRUD operations
   - Profile management

3. **Books Module**
   - Book recommendations endpoint
   - Integration with ML service

4. **Search History Module**
   - Save user searches
   - Retrieve search history
   - Delete history

### Phase 3: ML Service Separation

1. **Create Hugging Face Space**
   - FastAPI/Gradio app
   - Book recommendation logic
   - Embedding generation
   - Emotion analysis

2. **Update Backend**
   - HTTP client for ML service
   - Error handling
   - Caching (optional)

### Phase 4: Frontend Updates

1. **Update API Client**
   - Change base URL to NestJS backend
   - Update endpoint paths if needed

2. **Environment Variables**
   - Production API URLs
   - ML service URLs

### Phase 5: Production Configuration

1. **Environment Variables**
   - Database connection strings
   - JWT secrets
   - OAuth credentials
   - ML service URLs

2. **Docker Configuration**
   - Dockerfile for NestJS
   - docker-compose for local development

3. **CI/CD Setup**
   - GitHub Actions (optional)
   - Deployment scripts

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Search History Table
```sql
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query TEXT,
    category VARCHAR(50),
    tone VARCHAR(50),
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=book_recommendation

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# ML Service
ML_SERVICE_URL=https://your-model.hf.space

# Server
PORT=3000
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_ML_SERVICE_URL=https://your-model.hf.space
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
```

---

## 🚀 Deployment Steps

### 1. Deploy ML Services (Hugging Face)

1. Create Hugging Face Space
2. Upload ML service code
3. Configure requirements
4. Deploy and get URL

### 2. Deploy Backend (Render)

1. Connect GitHub repository
2. Configure build command: `npm install && npm run build`
3. Configure start command: `npm run start:prod`
4. Set environment variables
5. Deploy

### 3. Deploy Frontend (Vercel)

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

---

## 📝 API Endpoints (NestJS)

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Books
- `POST /books/recommend` - Get recommendations
- `GET /books/popular` - Get popular books

### Search History
- `GET /search-history` - Get user search history
- `POST /search-history` - Save search
- `DELETE /search-history/:id` - Delete search

### Health
- `GET /health` - Health check

---

## 🔧 Development Setup

### Local Development

1. **PostgreSQL**
   ```bash
   # Using Docker
   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## ✅ Checklist

### Backend (NestJS)
- [ ] Initialize NestJS project
- [ ] Configure PostgreSQL
- [ ] Set up TypeORM
- [ ] Create User entity
- [ ] Create SearchHistory entity
- [ ] Implement authentication
- [ ] Implement book recommendations
- [ ] Implement search history
- [ ] Add Swagger documentation
- [ ] Add error handling
- [ ] Add validation
- [ ] Add logging
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Write tests

### ML Services
- [ ] Create Hugging Face Space
- [ ] Deploy recommendation service
- [ ] Test ML service endpoints
- [ ] Document API

### Frontend
- [ ] Update API base URL
- [ ] Test all endpoints
- [ ] Update environment variables
- [ ] Test authentication flow
- [ ] Test search history

### Deployment
- [ ] Set up PostgreSQL database (Render/Supabase)
- [ ] Deploy ML service (Hugging Face)
- [ ] Deploy backend (Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configure domain (optional)
- [ ] Set up monitoring (optional)

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Hugging Face Spaces](https://huggingface.co/spaces)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🎯 Next Steps

1. Initialize NestJS project
2. Set up PostgreSQL database
3. Migrate authentication
4. Migrate book recommendations
5. Create search history feature
6. Set up ML service on Hugging Face
7. Update frontend
8. Deploy to production
