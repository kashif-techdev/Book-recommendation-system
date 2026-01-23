# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Book Recommendation System.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter a project name (e.g., "Book Recommendation System")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace account)
   - Fill in the required information:
     - App name: BookWise
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Add scopes: `email`, `profile`, `openid`
   - Click "Save and Continue"
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"
4. Back in Credentials, select "Web application" as the application type
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:5000` (for backend if needed)
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
7. Click "Create"
8. Copy the **Client ID** (you'll need this)

## Step 4: Configure Environment Variables

### Backend (.env file in backend directory)

Create a `.env` file in the `backend` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///book_recommendation.db
```

### Frontend (.env.local file in frontend directory)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

## Step 5: Restart Your Servers

After setting up the environment variables:

1. Restart the backend server:
   ```bash
   cd backend
   python api_server.py
   ```

2. Restart the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

## Testing Google OAuth

1. Navigate to `http://localhost:3000/login`
2. You should see a "Sign in with Google" button
3. Click it and complete the Google sign-in flow
4. You should be redirected back and logged in

## Troubleshooting

### "Google OAuth not configured" error

- Make sure `GOOGLE_CLIENT_ID` is set in your backend `.env` file
- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in your frontend `.env.local` file
- Restart both servers after adding environment variables

### "Invalid Google token" error

- Verify your Google Client ID is correct
- Make sure the authorized JavaScript origins include `http://localhost:3000`
- Check that Google+ API is enabled in Google Cloud Console

### Button not showing

- Check browser console for errors
- Verify the Google Identity Services script is loading
- Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly

## Production Deployment

For production:

1. Update authorized JavaScript origins to your production domain
2. Update authorized redirect URIs to your production domain
3. Use secure environment variable management
4. Consider using a more secure JWT secret key
5. Enable HTTPS (required for Google OAuth in production)

## Security Notes

- Never commit `.env` or `.env.local` files to version control
- Use strong, unique JWT secret keys in production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
