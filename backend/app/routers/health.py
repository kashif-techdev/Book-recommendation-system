from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.book_service import books

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        books_loaded=len(books)
    )
