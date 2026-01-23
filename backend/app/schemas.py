from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# Book Recommendation Schemas
class RecommendationRequest(BaseModel):
    query: str = ""
    category: str = "All"
    tone: str = "All"
    limit: int = 10


class BookResponse(BaseModel):
    isbn13: str
    title: str
    authors: str
    thumbnail: str
    description: str
    simple_categories: str
    published_year: Optional[int] = None
    average_rating: Optional[float] = None
    num_pages: Optional[int] = None
    ratings_count: Optional[int] = None
    joy: float = 0.0
    sadness: float = 0.0
    anger: float = 0.0
    fear: float = 0.0
    surprise: float = 0.0


class RecommendationData(BaseModel):
    books: List[BookResponse]
    total: int


class RecommendationResponse(BaseModel):
    success: bool
    data: RecommendationData
    message: str


# Authentication Schemas
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    profile_picture: Optional[str] = None
    created_at: Optional[str] = None


class AuthData(BaseModel):
    user: UserResponse
    token: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    data: AuthData


class UserData(BaseModel):
    user: UserResponse


class UserInfoResponse(BaseModel):
    success: bool
    data: UserData


class MessageResponse(BaseModel):
    success: bool
    message: str


class ErrorResponse(BaseModel):
    success: bool
    error: str


class HealthResponse(BaseModel):
    status: str
    books_loaded: int
