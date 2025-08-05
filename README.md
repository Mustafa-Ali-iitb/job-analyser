# Job Analyzer

A full-stack web application that uses Natural Language Processing (NLP) to analyze job descriptions and extract key insights including required skills, role type, experience level, and comprehensive summaries.

## Overview

Job Analyzer is designed to help job seekers and recruiters quickly understand the requirements and expectations of job postings. The application processes job descriptions using advanced NLP techniques to identify technical skills, determine the appropriate role category, assess experience requirements, and generate human-readable summaries.

## Features

### Core Functionality
- **Job Description Analysis**: Upload or paste job descriptions for instant analysis
- **Skill Extraction**: Automatically identify technical skills and technologies mentioned
- **Role Classification**: Determine job role type (Frontend, Backend, Fullstack, DevOps, etc.)
- **Experience Level Detection**: Assess required experience level (Junior, Mid-level, Senior, etc.)
- **Intelligent Summarization**: Generate concise, relevant summaries using AI
- **User Authentication**: Secure login and registration system
- **Analysis History**: Track and review previous analyses

### Technical Features
- **Real-time Processing**: Fast analysis using optimized NLP pipelines
- **Secure API**: JWT-based authentication with proper security measures
- **Data Persistence**: MongoDB database for user data and analysis history
- **Docker Support**: Complete containerization for easy deployment

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework for building APIs
- **spaCy**: Industrial-strength NLP library for text processing
- **Transformers**: Hugging Face library for advanced text generation
- **PyTorch**: Deep learning framework for NLP models
- **MongoDB**: NoSQL database for data storage
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **CSS3**: Modern styling with responsive design
- **Nginx**: Web server for serving the React application

### Infrastructure
- **Docker**: Containerization for consistent deployment
- **Docker Compose**: Multi-container orchestration
- **MongoDB**: Database container with initialization scripts

## Architecture

The application follows a modern microservices architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. User submits job description through React frontend
2. Frontend sends request to FastAPI backend with authentication
3. Backend processes text using NLP pipeline
4. Results are stored in MongoDB and returned to frontend
5. Frontend displays analysis results in user-friendly format

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM and 10GB disk space

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/Mustafa-Ali-iitb/job-analyser.git
cd job-analyser

# Create environment file
cp .env.example .env
# Edit .env file with your configuration
# The .env.example file contains all required variables with default values

## Environment Variables

The following environment variables are required:

### MongoDB Configuration
- `MONGODB_URI`: MongoDB connection string (optional)
  - **If not set**: Automatically uses local MongoDB container
  - **If set**: Uses your external MongoDB instance
  - **External MongoDB example**: `mongodb://your-username:your-password@your-host:27017/your-database?authSource=admin`

### JWT Authentication
- `JWT_SECRET_KEY`: Secret key for JWT token generation (change in production)
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)

### Frontend Configuration
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8000)

## Database Setup

### Automatic Setup
The application automatically handles database setup:

- **If MONGODB_URI is not set**: Uses local MongoDB container with automatic initialization
- **If MONGODB_URI is set**: Uses your external MongoDB (requires manual initialization)

### Manual Setup for External MongoDB
If you're using an external MongoDB instance, you need to manually run the initialization script:

```bash
# Connect to your MongoDB and run the init script
mongo your-mongodb-uri backend/init-mongo.js
```

This script will:
- Create required collections (`users`, `analyses`)
- Set up database indexes for performance
- Create a default admin user (admin/admin123)
- Configure data validation schemas


## Start all services

```bash
docker-compose up --build
```

The application will automatically:
- Use local MongoDB if MONGODB_URI is not set in .env
- Use external MongoDB if MONGODB_URI is provided in .env

Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000


## Usage

1. **Register/Login**: Create an account or use the default admin credentials
2. **Submit Job Description**: Paste or type a job description (up to 3000 characters)
3. **View Analysis**: Get instant insights including:
   - Extracted technical skills
   - Identified role type
   - Required experience level
   - AI-generated summary
4. **Review History**: Access previous analyses from your dashboard

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /user` - Get current user details

### Analysis
- `POST /analyze` - Analyze job description
- `GET /history` - Get recent analysis history
- `GET /analyses` - Get all user analyses
- `GET /stats` - Get user statistics

## Development

### Local Development Setup
```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm start
```

### Code Structure
```
job-analyser/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry point
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database connection
│   ├── nlp_service.py      # NLP processing pipeline
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS stylesheets
│   └── package.json       # Node.js dependencies
└── docker-compose.yml      # Docker orchestration
```

## NLP Pipeline

The application uses a sophisticated NLP pipeline for job description analysis:

1. **Text Preprocessing**: Clean and normalize input text
2. **Skill Extraction**: Use multiple methods (phrase matching, NER, keyword extraction)
3. **Role Detection**: Pattern matching and skill-based inference
4. **Experience Assessment**: Regex patterns and keyword analysis
5. **Summary Generation**: AI-powered text summarization with fallback methods

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

## Performance Considerations

- **Model Caching**: NLP models are loaded once and reused
- **Database Indexing**: Optimized queries with proper indexes
- **Response Caching**: Analysis results are stored for quick retrieval
- **Async Processing**: Non-blocking API operations


## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - If using local MongoDB: Check if MongoDB container is running
   - If using external MongoDB: Verify connection string in `.env` file
   - Verify MongoDB credentials

2. **Port Already in Use**
   - Change ports in `docker-compose.yml` if 3000 or 8000 are occupied
   - Kill existing containers: `docker-compose down`

3. **Build Failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild containers: `docker-compose up --build --force-recreate`

4. **Memory Issues**
   - Ensure at least 4GB RAM available
   - Close other applications to free memory

### Getting Help

- Check Docker logs: `docker-compose logs [service-name]`
- Verify environment variables: `docker-compose config`
- Test individual services: `docker-compose up [service-name]`

## Acknowledgments

- spaCy for excellent NLP capabilities
- Hugging Face for transformer models
- FastAPI for the modern Python web framework
- React team for the frontend framework
