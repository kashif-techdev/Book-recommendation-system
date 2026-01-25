# ML Services for Hugging Face Spaces

This directory contains ML services that will be deployed on Hugging Face Spaces.

## 📁 Structure

- `book-recommendations/` - Book recommendation service using semantic search (FastAPI only)

## 🚀 Deployment to Hugging Face

### Steps:

1. **Create a Hugging Face Space**
   - Go to https://huggingface.co/spaces
   - Click "Create new Space"
   - Choose **"Docker"** SDK (not Gradio, since we're using FastAPI)
   - Name it (e.g., `book-recommendations`)

2. **Upload Files**
   - Upload `app.py`
   - Upload `requirements.txt`
   - Upload `Dockerfile`
   - Upload `books_with_emotions.csv` (or use Hugging Face Datasets)

3. **Configure Space**
   - Set hardware: CPU (sufficient for this service)
   - Set visibility: Public or Private

4. **Deploy**
   - Hugging Face will automatically build and deploy using Docker
   - Get the Space URL (e.g., `https://your-username-book-recommendations.hf.space`)

5. **Update Backend**
   - Set `ML_SERVICE_URL` environment variable in NestJS backend
   - Use the Space URL as the ML service endpoint (e.g., `https://your-username-book-recommendations.hf.space`)

## 📝 API Endpoints

### POST /recommend
```json
{
  "query": "mystery thriller",
  "category": "Fiction",
  "tone": "Suspenseful",
  "limit": 10
}
```

Response:
```json
{
  "success": true,
  "data": {
    "books": [...],
    "total": 10
  },
  "message": "Found 10 recommendations"
}
```

### GET /health
Returns service health status.

### GET /docs
FastAPI Swagger documentation (interactive API docs).

## 🔧 Local Testing

```bash
cd book-recommendations
pip install -r requirements.txt
python app.py
```

Visit:
- API: http://localhost:7860
- API Docs: http://localhost:7860/docs
- Health: http://localhost:7860/health

## 📌 Note

This service uses **FastAPI only** (no Gradio interface) since the Next.js frontend handles all UI. The service is purely an API backend for book recommendations.
