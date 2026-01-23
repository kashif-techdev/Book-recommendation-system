from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.database import get_db
from app.models import User
from app.schemas import (
    RegisterRequest, LoginRequest, GoogleAuthRequest,
    AuthResponse, UserInfoResponse, MessageResponse, ErrorResponse,
    UserResponse, AuthData, UserData
)
from app.security import create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        username = user_data.username.strip()
        email = user_data.email.strip().lower()
        password = user_data.password
        
        # Validation
        if not username or not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username, email, and password are required"
            )
        
        if len(password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # Check if user already exists
        if db.query(User).filter(User.username == username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create access token (identity must be a string)
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return AuthResponse(
            success=True,
            message="User registered successfully",
            data=AuthData(
                user=UserResponse(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    profile_picture=user.profile_picture,
                    created_at=user.created_at.isoformat() if user.created_at else None
                ),
                token=access_token
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error in register: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/login", response_model=AuthResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user with username/email and password"""
    try:
        username = login_data.username.strip()
        password = login_data.password
        
        if not username or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username and password are required"
            )
        
        # Find user by username or email
        user = db.query(User).filter(
            or_(User.username == username, User.email == username)
        ).first()
        
        if not user or not user.check_password(password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # Create access token (identity must be a string)
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return AuthResponse(
            success=True,
            message="Login successful",
            data=AuthData(
                user=UserResponse(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    profile_picture=user.profile_picture,
                    created_at=user.created_at.isoformat() if user.created_at else None
                ),
                token=access_token
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me", response_model=UserInfoResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    try:
        return UserInfoResponse(
            success=True,
            data=UserData(
                user=UserResponse(
                    id=current_user.id,
                    username=current_user.username,
                    email=current_user.email,
                    profile_picture=current_user.profile_picture,
                    created_at=current_user.created_at.isoformat() if current_user.created_at else None
                )
            )
        )
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (client-side token removal)"""
    # With JWT, logout is handled client-side by removing the token
    # This endpoint is here for consistency and future token blacklisting
    return MessageResponse(
        success=True,
        message="Logged out successfully"
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(google_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate user with Google OAuth"""
    try:
        token = google_data.token
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token is required"
            )
        
        # Verify the Google ID token
        google_client_id = settings.GOOGLE_CLIENT_ID
        
        if not google_client_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable."
            )
        
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                google_client_id
            )
            
            # Get user info from Google
            google_id = idinfo.get('sub')
            email = idinfo.get('email')
            name = idinfo.get('name', email.split('@')[0] if email else 'user')
            picture = idinfo.get('picture')
            
            if not google_id or not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google token"
                )
            
            # Check if user exists by Google ID
            user = db.query(User).filter(User.google_id == google_id).first()
            
            if not user:
                # Check if user exists by email (in case they registered with email first)
                user = db.query(User).filter(User.email == email).first()
                
                if user:
                    # Link Google account to existing user
                    user.google_id = google_id
                    user.profile_picture = picture
                    db.commit()
                    db.refresh(user)
                else:
                    # Create new user
                    # Generate username from email or name
                    base_username = name.lower().replace(' ', '_')
                    username = base_username
                    counter = 1
                    
                    # Ensure username is unique
                    while db.query(User).filter(User.username == username).first():
                        username = f"{base_username}_{counter}"
                        counter += 1
                    
                    user = User(
                        username=username,
                        email=email,
                        google_id=google_id,
                        profile_picture=picture,
                        password_hash=None  # No password for OAuth users
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
            else:
                # Update profile picture if changed
                if picture and user.profile_picture != picture:
                    user.profile_picture = picture
                    db.commit()
                    db.refresh(user)
            
            # Create access token (identity must be a string)
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthResponse(
                success=True,
                message="Google authentication successful",
                data=AuthData(
                    user=UserResponse(
                        id=user.id,
                        username=user.username,
                        email=user.email,
                        profile_picture=user.profile_picture,
                        created_at=user.created_at.isoformat() if user.created_at else None
                    ),
                    token=access_token
                )
            )
            
        except ValueError as e:
            # Invalid token
            print(f"Google token verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in google_auth: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
