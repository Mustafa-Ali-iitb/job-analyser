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
- **Responsive Design**: Modern, mobile-friendly user interface
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

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd job-analyser

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Default Credentials
- **Username**: admin
- **Password**: admin123

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
├── docker-compose.yml      # Docker orchestration
└── DOCKER_README.md       # Docker setup guide
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Check the [Docker README](DOCKER_README.md) for deployment issues
- Review the [Explanation Document](explanation.md) for technical details
- Open an issue on the project repository

## Acknowledgments

- spaCy for excellent NLP capabilities
- Hugging Face for transformer models
- FastAPI for the modern Python web framework
- React team for the frontend framework
