// MongoDB initialization script for Job Analyzer application
// This script runs when the MongoDB container starts for the first time

// Switch to the job_analyzer database
db = db.getSiblingDB('job_analyzer');

// Create users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "password", "email", "name", "role", "created_at"],
      properties: {
        username: {
          bsonType: "string",
          description: "Username must be a string and is required"
        },
        password: {
          bsonType: "string",
          description: "Hashed password must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email must be a valid email address and is required"
        },
        name: {
          bsonType: "string",
          description: "Full name must be a string and is required"
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin"],
          description: "Role must be either 'user' or 'admin' and is required"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp must be a date and is required"
        }
      }
    }
  }
});

// Create analyses collection with validation
db.createCollection('analyses', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "job_description", "analysis", "created_at"],
      properties: {
        username: {
          bsonType: "string",
          description: "Username must be a string and is required"
        },
        job_description: {
          bsonType: "string",
          description: "Job description text must be a string and is required"
        },
        analysis: {
          bsonType: "object",
          description: "Analysis results must be an object and is required"
        },
        created_at: {
          bsonType: "date",
          description: "Creation timestamp must be a date and is required"
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.analyses.createIndex({ "username": 1 });
db.analyses.createIndex({ "created_at": -1 });

// Create default admin user
// Note: In production, change these credentials or remove this section
db.users.insertOne({
  username: "admin",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eG", // "admin123"
  email: "admin@jobanalyzer.com",
  name: "System Administrator",
  role: "admin",
  created_at: new Date()
});

print("MongoDB initialization completed successfully");
print("Database: job_analyzer");
print("Collections: users, analyses");
print("Default admin user: admin / admin123");
print("Remember to change default credentials in production"); 