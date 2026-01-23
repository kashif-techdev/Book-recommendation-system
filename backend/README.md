# 📚 Book Recommendation System using LLMs

This project is about building a smart book recommendation system using large language models (LLMs) and Python. The idea is to use book descriptions to understand what each book is about and then match readers with books that are similar in content.

Instead of using traditional keyword-based methods, this system converts book descriptions into vectors (numerical representations) and compares them using similarity search. This helps in finding books that are truly related in meaning, not just by title or tags.

---

## 🔍 What This Project Does

- Cleans and filters book description data.
- Uses LLMs to turn each description into a vector.
- Stores all book vectors and enables searching through them.
- Allows you to get book recommendations based on content similarity.
- Applies zero-shot classification to tag books with relevant topics.
- Analyzes sentiment and emotions from descriptions to enrich recommendations.
- Includes a simple UI to interact with the system and explore recommendations.

---

## 🧠 Tools & Technologies

- **Next js** for frontend.
- **Python** for all development.
- **Hugging Face Transformers** for embeddings and classification.
- **LangChain** for working with LLMs and chaining tasks.
- **Pandas & NumPy** for data cleaning and handling.
- **Vector Search** to find similar book descriptions quickly.
- **FastAPI** (migrated from Flask) to send data from backend to frontend.

---

## 🗂️ Project Workflow

1. Load and clean book dataset.
2. Filter out books with missing or short descriptions.
3. Generate vector representations for each book description.
4. Build a vector database to enable fast similarity searches.
5. Classify books into topics using zero-shot learning.
6. Analyze emotional tone in descriptions using fine-tuned models.
7. and then sent the data to front-end from backend through FastAPI.

---

## 🚀 Running the Server

### Development Mode

```bash
# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run_server.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --workers 4
```

### API Documentation

Once the server is running, you can access:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc
- **Health Check**: http://localhost:5000/health

---

## 📝 Migration from Flask to FastAPI

This project has been migrated from Flask to FastAPI. The old Flask server (`api_server.py`) is kept for reference but is no longer used. All endpoints remain the same for backward compatibility with the frontend.

### Key Changes:
- ✅ Modern async/await support
- ✅ Automatic API documentation
- ✅ Type validation with Pydantic
- ✅ Better performance
- ✅ Same API endpoints (no frontend changes needed)

---

## 🧪 Why This Project Is Interesting

This isn't just another recommendation system based on ratings or tags. It focuses on the *meaning* of the book using natural language processing and lets the model decide what books are similar based on deep understanding, not just surface-level metadata. It also mixes multiple techniques—like classification, vector search, and sentiment analysis—to give more personalized and intelligent results.

---

## 🎯 What We Learn

- How to use LLMs for real-world NLP tasks.
- Building and using vector databases for recommendations.
- How zero-shot classification works and when to use it.
- Creating a working interface to test AI applications.
- Combining different AI tools into one functional system.

--

