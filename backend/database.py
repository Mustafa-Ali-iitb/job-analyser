from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
from typing import Optional

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_mongodb_client() -> MongoClient:
    """Initialize and return MongoDB client with proper configuration."""
    mongodb_uri = os.getenv("MONGODB_URI")
    
    if not mongodb_uri:
        logger.warning("MONGODB_URI not found, using local MongoDB")
        return MongoClient("mongodb://localhost:27017/")
    
    try:
        client = MongoClient(
            mongodb_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        return client
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.info("Falling back to local MongoDB")
        return MongoClient("mongodb://localhost:27017/")


client = get_mongodb_client()
db = client.job_analyzer

users_collection = db.users
analyses_collection = db.analyses