from fastapi import APIRouter, HTTPException
from concurrent.futures import ThreadPoolExecutor
import asyncio
from app.schemas import RecommendationRequest, RecommendationResponse, RecommendationData
from app.services.book_service import retrieve_semantic_recommendations, format_book_data

router = APIRouter(prefix="/recommend", tags=["books"])

# Thread pool for CPU-intensive operations
executor = ThreadPoolExecutor(max_workers=2)


def _process_recommendations(query: str, category: str, tone: str, limit: int):
    """Process recommendations in a separate thread"""
    recommendations = retrieve_semantic_recommendations(
        query=query,
        category=category,
        tone=tone,
        final_top_k=limit
    )
    
    results = []
    for _, row in recommendations.iterrows():
        book_data = format_book_data(row)
        results.append(book_data)
    
    return results


@router.post("", response_model=RecommendationResponse)
async def recommend_books(request: RecommendationRequest):
    """Get book recommendations based on query, category, and tone"""
    try:
        # Run CPU-intensive pandas operations in thread pool
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            executor,
            _process_recommendations,
            request.query,
            request.category,
            request.tone,
            request.limit
        )
        
        return RecommendationResponse(
            success=True,
            data=RecommendationData(
                books=results,
                total=len(results)
            ),
            message=f'Found {len(results)} recommendations'
        )
        
    except Exception as e:
        print(f"Error in recommend_books: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
