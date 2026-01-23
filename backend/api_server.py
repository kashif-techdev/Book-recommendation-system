from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
import json
import os
from datetime import timedelta
from sqlalchemy import inspect as sqlalchemy_inspect
from models import db, User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///book_recommendation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID', '')

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)  # Enable CORS for frontend communication

# Create database tables
with app.app_context():
    # Check if tables exist, if not create them
    # If they exist, check if we need to add new columns (for development)
    try:
        inspector = sqlalchemy_inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if 'users' in existing_tables:
            # Check if google_id column exists
            columns = [col['name'] for col in inspector.get_columns('users')]
            if 'google_id' not in columns:
                # Add missing columns using ALTER TABLE
                print("Updating database schema...")
                try:
                    with db.engine.connect() as conn:
                        conn.execute(db.text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                        conn.execute(db.text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)"))
                        conn.commit()
                    # Try to create index (may fail if it exists)
                    try:
                        with db.engine.connect() as conn:
                            conn.execute(db.text("CREATE INDEX ix_users_google_id ON users(google_id)"))
                            conn.commit()
                    except:
                        pass  # Index might already exist
                    print("Database schema updated with Google OAuth fields")
                except Exception as e:
                    print(f"Error updating schema: {e}")
                    print("Dropping and recreating tables...")
                    db.drop_all()
                    db.create_all()
                    print("Database recreated with updated schema")
            else:
                print("Database schema is up to date")
        else:
            # Create all tables if they don't exist
            db.create_all()
            print("Database initialized")
    except Exception as e:
        print(f"Error checking database schema: {e}")
        # Fallback: create all tables
        db.create_all()
        print("Database initialized (fallback)")

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

# Authentication Routes
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not username or not email or not password:
            return jsonify({
                'success': False,
                'error': 'Username, email, and password are required'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({
                'success': False,
                'error': 'Username already exists'
            }), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token (identity must be a string)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user': user.to_dict(),
                'token': access_token
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in register: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': 'Username and password are required'
            }), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'success': False,
                'error': 'Invalid username or password'
            }), 401
        
        # Create access token (identity must be a string)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'token': access_token
            }
        }), 200
        
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        
        # Convert to int if it's a string (JWT identity should be string, but handle both)
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid user ID in token'
                }), 401
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user': user.to_dict()
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # With JWT, logout is handled client-side by removing the token
    # This endpoint is here for consistency and future token blacklisting
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@app.route('/auth/google', methods=['POST'])
def google_auth():
    try:
        data = request.get_json()
        token = data.get('token', '')
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Google token is required'
            }), 400
        
        # Verify the Google ID token
        google_client_id = app.config.get('GOOGLE_CLIENT_ID')
        
        if not google_client_id:
            # If no client ID configured, use a simple token-based approach
            # In production, you should always verify the token
            try:
                # Try to decode as JSON (for development/testing)
                import base64
                token_parts = token.split('.')
                if len(token_parts) == 3:
                    # This is a JWT-like token, but we'll use a simpler approach
                    # For production, use proper Google token verification
                    pass
            except:
                pass
            
            # For development: accept token and create user
            # In production, you MUST verify the token with Google
            return jsonify({
                'success': False,
                'error': 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID environment variable.'
            }), 400
        
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
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture')
            
            if not google_id or not email:
                return jsonify({
                    'success': False,
                    'error': 'Invalid Google token'
                }), 400
            
            # Check if user exists by Google ID
            user = User.query.filter_by(google_id=google_id).first()
            
            if not user:
                # Check if user exists by email (in case they registered with email first)
                user = User.query.filter_by(email=email).first()
                
                if user:
                    # Link Google account to existing user
                    user.google_id = google_id
                    user.profile_picture = picture
                    db.session.commit()
                else:
                    # Create new user
                    # Generate username from email or name
                    base_username = name.lower().replace(' ', '_')
                    username = base_username
                    counter = 1
                    
                    # Ensure username is unique
                    while User.query.filter_by(username=username).first():
                        username = f"{base_username}_{counter}"
                        counter += 1
                    
                    user = User(
                        username=username,
                        email=email,
                        google_id=google_id,
                        profile_picture=picture,
                        password_hash=None  # No password for OAuth users
                    )
                    db.session.add(user)
                    db.session.commit()
            else:
                # Update profile picture if changed
                if picture and user.profile_picture != picture:
                    user.profile_picture = picture
                    db.session.commit()
            
            # Create access token (identity must be a string)
            access_token = create_access_token(identity=str(user.id))
            
            return jsonify({
                'success': True,
                'message': 'Google authentication successful',
                'data': {
                    'user': user.to_dict(),
                    'token': access_token
                }
            }), 200
            
        except ValueError as e:
            # Invalid token
            print(f"Google token verification error: {e}")
            return jsonify({
                'success': False,
                'error': 'Invalid Google token'
            }), 401
            
    except Exception as e:
        print(f"Error in google_auth: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Book Recommendation API Server...")
    print("Available books:", len(books))
    print("API will be available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
