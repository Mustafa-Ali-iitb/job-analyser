# Job Analyzer - Docker Setup

This document provides instructions for running the Job Analyzer application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd job-analyser
```

### 2. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MongoDB**: localhost:27017

## Project Structure

```
job-analyser/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── init-mongo.js
│   ├── .dockerignore
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   └── nlp_service.py
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── package.json
│   └── src/
├── docker-compose.yml
└── DOCKER_README.md
```

## Services

### 1. MongoDB (Database)
- **Image**: mongo:7.0
- **Port**: 27017
- **Database**: job_analyzer
- **Default Credentials**: admin/password123

### 2. Backend (FastAPI)
- **Port**: 8000
- **Features**: 
  - User authentication
  - Job analysis with NLP
  - RESTful API
- **Dependencies**: Python 3.11, spaCy, Transformers, PyTorch

### 3. Frontend (React + Nginx)
- **Port**: 3000
- **Features**:
  - Modern React UI
  - Responsive design
  - SPA routing

## Docker Commands

### Build Services
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start Services
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Check health status
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

## Environment Variables

### Backend Environment Variables
```bash
MONGODB_URI=mongodb://admin:password123@mongodb:27017/job_analyzer?authSource=admin
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=http://localhost:8000
```

## Database

### Default Admin User
- **Username**: admin
- **Password**: admin123
- **Email**: admin@jobanalyzer.com
- **Role**: admin

### Collections
- **users**: User accounts and authentication
- **analyses**: Job analysis history

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000
lsof -i :27017

# Kill the process or change ports in docker-compose.yml
```

#### 2. Memory Issues
```bash
# Check Docker memory usage
docker system df
docker stats

# Clean up unused resources
docker system prune -a
```

#### 3. Build Failures
```bash
# Clean build cache
docker-compose build --no-cache

# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans
```

#### 4. NLP Models Not Loading
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend with fresh models
docker-compose build --no-cache backend
```

### Log Locations
- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`
- **MongoDB**: `docker-compose logs mongodb`

## Production Deployment

### 1. Environment Variables
Create a `.env` file with production values:
```bash
# .env
MONGODB_URI=mongodb://your-mongo-uri
JWT_SECRET_KEY=your-production-secret-key
REACT_APP_API_URL=https://your-api-domain.com
```

### 2. Security Considerations
- Change default passwords
- Use strong JWT secrets
- Enable HTTPS
- Configure proper CORS settings
- Set up proper firewall rules

### 3. Scaling
```bash
# Scale backend services
docker-compose up --scale backend=3

# Use external MongoDB cluster
# Update MONGODB_URI in environment variables
```

## Monitoring

### Health Checks
All services include health checks:
- **Backend**: HTTP endpoint at `/`
- **Frontend**: HTTP endpoint at `/health`
- **MongoDB**: Built-in health check

### Metrics
```bash
# View resource usage
docker stats

# View service status
docker-compose ps
```

## Cleanup

### Remove Everything
```bash
# Stop and remove all containers, networks, volumes, and images
docker-compose down --rmi all --volumes --remove-orphans

# Remove all unused Docker resources
docker system prune -a
```

### Remove Specific Resources
```bash
# Remove only containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers and images
docker-compose down --rmi all
```

## Development

### Development Mode
```bash
# Run with volume mounts for live code changes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Debugging
```bash
# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mongodb mongosh

# View real-time logs
docker-compose logs -f backend
```

## Contributing

1. Make changes to the code
2. Rebuild the affected service: `docker-compose build <service>`
3. Restart the service: `docker-compose up <service>`
4. Test your changes

## Support

For issues related to:
- **Docker setup**: Check this README and Docker documentation
- **Application functionality**: Check the main project README
- **NLP models**: Check backend logs for model loading issues 