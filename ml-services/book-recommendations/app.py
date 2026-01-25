"""
Book Recommendation ML Service for Hugging Face Spaces
FastAPI-only service for book recommendations using semantic search
"""

import pandas as pd
import numpy as np
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load books data
def load_books():
    """Load books data from CSV"""
    csv_path = os.path.join(os.path.dirname(__file__), "books_with_emotions.csv")
    try:
        books = pd.read_csv(csv_path)
        books["large_thumbnail"] = books["thumbnail"] + "&fife=w800"
        books["large_thumbnail"] = np.where(
            books["large_thumbnail"].isna(),
            "https://via.placeholder.com/200x300/8b5cf6/ffffff?text=No+Cover",
            books["large_thumbnail"],
        )
        print(f"Loaded {len(books)} books from CSV")
        return books
    except FileNotFoundError:
        print(f"CSV file not found at {csv_path}")
        return None

books_df = load_books()

def retrieve_semantic_recommendations(
    query: str,
    category: str = "All",
    tone: str = "All",
    limit: int = 10,
):
    """Retrieve book recommendations based on query, category, and tone"""
    if books_df is None:
        return {"error": "Books data not loaded"}
    
    books_copy = books_df.copy()
    
    # Enhanced search logic
    if query and query.strip():
        query_lower = query.lower().strip()
        query_words = query_lower.split()
        
        books_copy['search_score'] = 0
        
        for word in query_words:
            if len(word) > 2:
                title_matches = books_copy['title'].str.lower().str.contains(word, na=False, regex=False)
                books_copy.loc[title_matches, 'search_score'] += 10
                
                author_matches = books_copy['authors'].str.lower().str.contains(word, na=False, regex=False)
                books_copy.loc[author_matches, 'search_score'] += 8
                
                desc_matches = books_copy['description'].str.lower().str.contains(word, na=False, regex=False)
                books_copy.loc[desc_matches, 'search_score'] += 5
                
                cat_matches = books_copy['simple_categories'].str.lower().str.contains(word, na=False, regex=False)
                books_copy.loc[cat_matches, 'search_score'] += 3
        
        # Exact phrase matching
        exact_title = books_copy['title'].str.lower().str.contains(query_lower, na=False, regex=False)
        exact_author = books_copy['authors'].str.lower().str.contains(query_lower, na=False, regex=False)
        exact_desc = books_copy['description'].str.lower().str.contains(query_lower, na=False, regex=False)
        
        books_copy.loc[exact_title, 'search_score'] += 15
        books_copy.loc[exact_author, 'search_score'] += 12
        books_copy.loc[exact_desc, 'search_score'] += 8
        
        book_recs = books_copy[books_copy['search_score'] > 0].copy()
        
        if len(book_recs) == 0:
            book_recs = books_df.copy()
            book_recs = book_recs.sort_values(by="average_rating", ascending=False)
            book_recs = book_recs.head(limit)
            return format_results(book_recs)
        
        book_recs = book_recs.sort_values(['search_score', 'average_rating'], ascending=[False, False])
    else:
        book_recs = books_df.copy()
        book_recs = book_recs.sort_values(by="average_rating", ascending=False)

    if category and category != "All":
        book_recs = book_recs[book_recs["simple_categories"] == category]

    if tone and tone != "All":
        tone_map = {
            "Happy": "joy",
            "Surprising": "surprise",
            "Angry": "anger",
            "Suspenseful": "fear",
            "Sad": "sadness"
        }
        if tone in tone_map:
            book_recs = book_recs.sort_values(by=tone_map[tone], ascending=False)

    return format_results(book_recs.head(limit))

def format_results(book_recs):
    """Format book results for API response"""
    results = []
    for _, row in book_recs.iterrows():
        thumbnail = str(row['large_thumbnail']) if pd.notna(row['large_thumbnail']) else None
        
        if (not thumbnail or 'books.google.com' in thumbnail or 
            'via.placeholder.com' in thumbnail or thumbnail == 'nan' or
            'placeholder' in thumbnail.lower() or thumbnail == 'None' or len(thumbnail) < 10):
            
            isbn = str(row['isbn13']) if pd.notna(row['isbn13']) else '0000000000000'
            clean_isbn = ''.join(filter(str.isdigit, isbn))
            
            if len(clean_isbn) >= 10:
                thumbnail = f"https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg"
            else:
                category_colors = {
                    'Fiction': '8b5cf6',
                    'Nonfiction': '3b82f6',
                    "Children's Fiction": '10b981',
                    "Children's Nonfiction": 'f59e0b'
                }
                category = str(row.get('simple_categories', 'Fiction'))
                color = category_colors.get(category, '8b5cf6')
                title_short = str(row['title'])[:20].replace(' ', '+')
                thumbnail = f"https://via.placeholder.com/200x300/{color}/ffffff?text={title_short}"
        
        book_data = {
            'isbn13': str(row['isbn13']),
            'title': str(row['title']),
            'authors': str(row['authors']),
            'thumbnail': thumbnail,
            'description': str(row['description']),
            'simple_categories': str(row['simple_categories']),
            'published_year': int(row['published_year']) if pd.notna(row['published_year']) else None,
            'average_rating': float(row['average_rating']) if pd.notna(row['average_rating']) else None,
            'num_pages': int(row['num_pages']) if pd.notna(row['num_pages']) else None,
            'ratings_count': int(row['ratings_count']) if pd.notna(row['ratings_count']) else None,
            'joy': float(row['joy']) if pd.notna(row['joy']) else 0.0,
            'sadness': float(row['sadness']) if pd.notna(row['sadness']) else 0.0,
            'anger': float(row['anger']) if pd.notna(row['anger']) else 0.0,
            'fear': float(row['fear']) if pd.notna(row['fear']) else 0.0,
            'surprise': float(row['surprise']) if pd.notna(row['surprise']) else 0.0
        }
        results.append(book_data)
    
    return {
        'success': True,
        'data': {
            'books': results,
            'total': len(results)
        },
        'message': f'Found {len(results)} recommendations'
    }

# FastAPI Application
app = FastAPI(
    title="Book Recommendation ML Service",
    description="ML service for book recommendations using semantic search",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    query: str = ""
    category: str = "All"
    tone: str = "All"
    limit: int = 10

@app.post("/recommend")
async def recommend(request: RecommendationRequest):
    """Get book recommendations"""
    result = retrieve_semantic_recommendations(
        query=request.query,
        category=request.category,
        tone=request.tone,
        limit=request.limit
    )
    return result

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "books_loaded": len(books_df) if books_df is not None else 0
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Book Recommendation ML Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# For Hugging Face Spaces deployment
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
