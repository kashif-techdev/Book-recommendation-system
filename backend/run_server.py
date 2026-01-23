#!/usr/bin/env python3
"""
FastAPI Server Startup Script
Run this script to start the Book Recommendation API server.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting Book Recommendation API Server (FastAPI)...")
    print("API will be available at: http://localhost:5000")
    print("API Documentation: http://localhost:5000/docs")
    print("Alternative Docs: http://localhost:5000/redoc")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info"
    )
