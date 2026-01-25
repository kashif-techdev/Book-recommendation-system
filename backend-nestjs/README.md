# Book Recommendation Backend (NestJS)

Production-ready NestJS backend for the Book Recommendation System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Create PostgreSQL database
createdb book_recommendation

# Or using Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── config/                # Configuration
│   └── database.config.ts
├── auth/                  # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── guards/
├── users/                 # Users module
│   ├── users.module.ts
│   ├── users.service.ts
│   └── entities/
├── books/                 # Books module
│   ├── books.module.ts
│   ├── books.controller.ts
│   └── books.service.ts
├── search-history/        # Search history module
│   ├── search-history.module.ts
│   ├── search-history.controller.ts
│   ├── search-history.service.ts
│   └── entities/
└── ml-integration/        # ML service integration
    ├── ml-integration.module.ts
    └── ml-integration.service.ts
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Render Deployment

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:prod`
4. Add environment variables
5. Deploy!

See `PRODUCTION_DEPLOYMENT_PLAN.md` for detailed deployment instructions.
