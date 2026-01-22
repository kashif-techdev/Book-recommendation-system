from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load books data
try:
    books = pd.read_csv("books_with_emotions.csv")
    books["large_thumbnail"] = books["thumbnail"] + "&fife=w800"
    books["large_thumbnail"] = np.where(
        books["large_thumbnail"].isna(),
        "https://via.placeholder.com/200x300/8b5cf6/ffffff?text=No+Cover",
        books["large_thumbnail"],
    )
    print(f"Loaded {len(books)} books from CSV")
except FileNotFoundError:
    print("CSV file not found, using mock data")
    # Create mock data
    books = pd.DataFrame({
        'isbn13': ['9780002005883', '9780002261982', '9780006178736', '9780006280897', '9780006280934'],
        'title': ['Gilead', "Spider's Web", 'Rage of angels', 'The Four Loves', 'The Problem of Pain'],
        'authors': ['Marilynne Robinson', 'Charles Osborne;Agatha Christie', 'Sidney Sheldon', 'Clive Staples Lewis', 'Clive Staples Lewis'],
        'categories': ['Fiction', 'Detective and mystery stories', 'Fiction', 'Christian life', 'Christian life'],
        'thumbnail': ['https://covers.openlibrary.org/b/isbn/9780002005883-L.jpg'] * 5,
        'description': [
            'A novel about a preacher in Iowa reflecting on his family history and faith.',
            'A mystery novel adapted from Agatha Christie\'s play about a murder in a country house.',
            'A story about a brilliant attorney caught up in Mafia schemes.',
            'Lewis\' work on the nature of love divided into four categories.',
            'C.S. Lewis examines the question of why God allows suffering.'
        ],
        'published_year': [2004.0, 1993.0, 2002.0, 2002.0],
        'average_rating': [3.85, 3.83, 3.93, 4.15, 4.09],
        'num_pages': [247.0, 241.0, 512.0, 170.0, 176.0],
        'ratings_count': [361.0, 5164.0, 29532.0, 33684.0, 37569.0],
        'simple_categories': ['Fiction', 'Fiction', 'Fiction', 'Nonfiction', 'Nonfiction'],
        'joy': [0.93, 0.70, 0.77, 0.25, 0.04],
        'sadness': [0.65, 0.89, 0.55, 0.73, 0.88],
        'anger': [0.06, 0.61, 0.06, 0.35, 0.08],
        'fear': [0.93, 0.94, 0.97, 0.36, 0.10],
        'surprise': [0.97, 0.11, 0.11, 0.11, 0.48]
    })
    books["large_thumbnail"] = books["thumbnail"]

def retrieve_semantic_recommendations(
        query: str,
        category: str = None,
        tone: str = None,
        initial_top_k: int = 40,
        final_top_k: int = 10,
) -> pd.DataFrame:
    
    # Enhanced search logic with fallback
    if query and query.strip():
        query_lower = query.lower().strip()
        
        # Split query into individual words for better matching
        query_words = query_lower.split()
        
        # Create scoring system
        books['search_score'] = 0
        
        for word in query_words:
            if len(word) > 2:  # Only consider words longer than 2 characters
                # Title matches get highest score
                title_matches = books['title'].str.lower().str.contains(word, na=False, regex=False)
                books.loc[title_matches, 'search_score'] += 10
                
                # Author matches get high score
                author_matches = books['authors'].str.lower().str.contains(word, na=False, regex=False)
                books.loc[author_matches, 'search_score'] += 8
                
                # Description matches get medium score
                desc_matches = books['description'].str.lower().str.contains(word, na=False, regex=False)
                books.loc[desc_matches, 'search_score'] += 5
                
                # Category matches get low score
                cat_matches = books['simple_categories'].str.lower().str.contains(word, na=False, regex=False)
                books.loc[cat_matches, 'search_score'] += 3
        
        # Also try exact phrase matching for better results
        exact_title = books['title'].str.lower().str.contains(query_lower, na=False, regex=False)
        exact_author = books['authors'].str.lower().str.contains(query_lower, na=False, regex=False)
        exact_desc = books['description'].str.lower().str.contains(query_lower, na=False, regex=False)
        
        books.loc[exact_title, 'search_score'] += 15
        books.loc[exact_author, 'search_score'] += 12
        books.loc[exact_desc, 'search_score'] += 8
        
        # Filter books with any search score
        book_recs = books[books['search_score'] > 0].copy()
        
        # If no matches found, return some popular books instead of empty
        if len(book_recs) == 0:
            print(f"No matches found for query: '{query}', returning popular books")
            book_recs = books.copy()
            book_recs = book_recs.sort_values(by="average_rating", ascending=False)
            book_recs = book_recs.head(final_top_k)
            return book_recs
        
        # Sort by search score first, then by rating
        book_recs = book_recs.sort_values(['search_score', 'average_rating'], ascending=[False, False])
    else:
        book_recs = books.copy()
        # Sort by rating for general recommendations
        book_recs = book_recs.sort_values(by="average_rating", ascending=False)

    if category and category != "All":
        book_recs = book_recs[book_recs["simple_categories"] == category]

    if tone and tone != "All":
        if tone == "Happy":
            book_recs = book_recs.sort_values(by="joy", ascending=False)
        elif tone == "Surprising":
            book_recs = book_recs.sort_values(by="surprise", ascending=False)
        elif tone == "Angry":
            book_recs = book_recs.sort_values(by="anger", ascending=False)
        elif tone == "Suspenseful":
            book_recs = book_recs.sort_values(by="fear", ascending=False)
        elif tone == "Sad":
            book_recs = book_recs.sort_values(by="sadness", ascending=False)

    return book_recs.head(final_top_k)

@app.route('/recommend', methods=['POST'])
def recommend_books():
    try:
        data = request.get_json()
        query = data.get('query', '')
        category = data.get('category', 'All')
        tone = data.get('tone', 'All')
        limit = data.get('limit', 10)
        
        recommendations = retrieve_semantic_recommendations(query, category, tone, final_top_k=limit)
        
        results = []
        for _, row in recommendations.iterrows():
            # Handle thumbnail with comprehensive fallback logic
            thumbnail = str(row['large_thumbnail']) if pd.notna(row['large_thumbnail']) else None
            
            # Clean up problematic URLs and create proper fallbacks
            if (not thumbnail or 
                'books.google.com' in thumbnail or 
                'via.placeholder.com' in thumbnail or
                thumbnail == 'nan' or
                'placeholder' in thumbnail.lower() or
                thumbnail == 'None' or
                len(thumbnail) < 10):
                
                # Use OpenLibrary as primary fallback
                isbn = str(row['isbn13']) if pd.notna(row['isbn13']) else '0000000000000'
                # Remove any non-digit characters from ISBN
                clean_isbn = ''.join(filter(str.isdigit, isbn))
                
                if len(clean_isbn) >= 10:  # Valid ISBN length
                    # Try multiple OpenLibrary formats
                    thumbnail = f"https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg"
                else:
                    # Create a colored placeholder based on book category
                    category_colors = {
                        'Fiction': '8b5cf6',  # Purple
                        'Nonfiction': '3b82f6',  # Blue
                        "Children's Fiction": '10b981',  # Green
                        "Children's Nonfiction": 'f59e0b'  # Orange
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
        
        return jsonify({
            'success': True,
            'data': {
                'books': results,
                'total': len(results)
            },
            'message': f'Found {len(results)} recommendations'
        })
        
    except Exception as e:
        print(f"Error in recommend_books: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'books_loaded': len(books)
    })

if __name__ == '__main__':
    print("Starting Book Recommendation API Server...")
    print("Available books:", len(books))
    print("API will be available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
