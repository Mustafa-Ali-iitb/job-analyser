from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List, Dict, Any

from database import users_collection, analyses_collection
from auth import get_password_hash, verify_password, create_access_token, verify_token
from nlp_service import analyze_job_description

app = FastAPI(
    title="Job Analyzer API",
    description="API for analyzing job descriptions using NLP",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    name: str
    role: str


class UserLogin(BaseModel):
    username: str
    password: str


class JobAnalysis(BaseModel):
    job_description: str


@app.post("/register")
async def register(user: UserRegister):
    """Register a new user account."""
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "password": hashed_password,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "created_at": datetime.now(timezone.utc)
    }
    users_collection.insert_one(user_data)
    
    return {"message": "User created successfully"}


@app.post("/login")
async def login(user: UserLogin):
    """Authenticate user and return access token."""
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/user")
def get_current_user(current_user: str = Depends(verify_token)):
    """Get current authenticated user details."""
    user_data = users_collection.find_one(
        {"username": current_user},
        {"_id": 0, "password": 0}
    )
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user_data.get("username"),
        "name": user_data.get("name"),
        "email": user_data.get("email"),
        "role": user_data.get("role")
    }


@app.post("/analyze")
async def analyze_job(job_data: JobAnalysis, current_user: str = Depends(verify_token)):
    """Analyze job description and return insights."""
    analysis = analyze_job_description(job_data.job_description)
    
    analysis_data = {
        "username": current_user,
        "job_description": job_data.job_description,
        "analysis": analysis,
        "created_at": datetime.now(timezone.utc)
    }
    analyses_collection.insert_one(analysis_data)
    
    return analysis


@app.get("/history")
async def get_history(current_user: str = Depends(verify_token)):
    """Get user's recent analysis history (last 10)."""
    history = list(analyses_collection.find(
        {"username": current_user},
        {"_id": 0}
    ).sort("created_at", -1).limit(10))
    
    return history


@app.get("/analyses")
async def get_all_analyses(current_user: str = Depends(verify_token)):
    """Get all analyses for the authenticated user."""
    all_analyses = list(analyses_collection.find(
        {"username": current_user},
        {"_id": 0}
    ).sort("created_at", -1))
    
    return {
        "analyses": all_analyses, 
        "total_count": len(all_analyses),
        "username": current_user
    }


@app.get("/stats")
async def get_user_stats(current_user: str = Depends(verify_token)):
    """Get user analysis statistics and distributions."""
    total_analyses = analyses_collection.count_documents({"username": current_user})
    
    role_pipeline = [
        {"$match": {"username": current_user}},
        {"$group": {"_id": "$analysis.role_type", "count": {"$sum": 1}}}
    ]
    role_stats = list(analyses_collection.aggregate(role_pipeline))
    
    experience_pipeline = [
        {"$match": {"username": current_user}},
        {"$group": {"_id": "$analysis.experience_level", "count": {"$sum": 1}}}
    ]
    experience_stats = list(analyses_collection.aggregate(experience_pipeline))
    
    return {
        "total_analyses": total_analyses,
        "role_distribution": {item["_id"]: item["count"] for item in role_stats},
        "experience_distribution": {item["_id"]: item["count"] for item in experience_stats}
    }


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Job Analyzer API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)