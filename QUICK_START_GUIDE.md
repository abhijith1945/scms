# Smart Campus Management System (SCMS)

## Project Overview
A complete campus management system with authentication, course management, attendance tracking, and assignment submission features.

**Tech Stack:**
- Backend: Java 17 + Spring Boot 3.x + PostgreSQL
- Frontend: React.js + Vite + Material-UI
- Auth: JWT-based authentication
- Database: PostgreSQL 15

## Quick Start Guide

### Prerequisites (Install First)
1. **Java 17 JDK**: https://adoptium.net
2. **Maven 3.9+**: https://maven.apache.org
3. **Node.js 20 LTS**: https://nodejs.org
4. **Docker Desktop**: https://www.docker.com/products/docker-desktop
5. **PostgreSQL 15**: Already included in Docker

### Step 1: Start Docker Containers
```powershell
cd c:\Users\abhij\scms
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- pgAdmin on port 5050 (http://localhost:5050)

### Step 2: Create Database and Run Migrations
```powershell
# Connect to PostgreSQL
docker exec -it scms-postgres-1 psql -U postgres

# Inside psql, run:
CREATE DATABASE scms_users;
\c scms_users
\i /docker-entrypoint-initdb.d/V1__init.sql
\i /docker-entrypoint-initdb.d/data.sql
\q
```

**Alternative: Run SQL files manually**
```powershell
# Copy SQL files to container
docker cp database/migrations/V1__init.sql scms-postgres-1:/tmp/
docker cp database/seeds/data.sql scms-postgres-1:/tmp/

# Execute them
docker exec -it scms-postgres-1 psql -U postgres -d scms_users -f /tmp/V1__init.sql
docker exec -it scms-postgres-1 psql -U postgres -d scms_users -f /tmp/data.sql
```

### Step 3: Start Backend (Spring Boot)
Open a new terminal:
```powershell
cd c:\Users\abhij\scms\backend\user-service
mvn spring-boot:run
```

Backend will start on **http://localhost:8081**

Wait for the message: `Started UserServiceApplication in X seconds`

### Step 4: Start Frontend (React)
Open another terminal:
```powershell
cd c:\Users\abhij\scms\frontend
npm run dev
```

Frontend will start on **http://localhost:5173**

## Test Credentials

### Student Login
- Email: `student1@scms.edu`
- Password: `password123`
- Name: Abhijith Unni

### Faculty Login
- Email: `faculty1@scms.edu`
- Password: `password123`
- Name: Rajesh Kumar

### Admin Login
- Email: `admin@scms.edu`
- Password: `password123`

## Features Implemented

### Student Features
✅ Login with JWT authentication
✅ View enrolled courses
✅ View attendance with percentage calculation
✅ View pending and submitted assignments
✅ Submit assignments with file upload
✅ View grades and feedback

### Faculty Features
✅ Login with JWT authentication
✅ View all courses
✅ Mark attendance (bulk marking)
✅ Create assignments
✅ View student submissions
✅ Grade assignments

### Sample Data
- 1 Admin user
- 1 Faculty member (Rajesh Kumar)
- 2 Students (Abhijith Unni, Priya Nair)
- 3 Courses (Data Structures, DBMS, Operating Systems)
- 20+ Attendance records
- 5 Assignments

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/enrolled` - Get enrolled courses (student)

### Attendance
- `GET /api/attendance/student/{studentId}` - Get student attendance
- `GET /api/attendance/me` - Get my attendance
- `POST /api/attendance/mark` - Mark attendance (faculty)
- `POST /api/attendance/bulk` - Bulk mark attendance (faculty)

### Assignments
- `GET /api/assignments/course/{courseId}` - Get assignments for course
- `GET /api/assignments/my` - Get my assignments (student)
- `POST /api/assignments` - Create assignment (faculty)
- `POST /api/assignments/{id}/submit` - Submit assignment (student)
- `PUT /api/assignments/submissions/{id}/grade` - Grade submission (faculty)

## Project Structure

```
scms/
├── backend/
│   └── user-service/          # Spring Boot application
│       ├── src/main/java/com/scms/userservice/
│       │   ├── model/         # JPA entities
│       │   ├── repository/    # Spring Data repositories
│       │   ├── service/       # Business logic
│       │   ├── controller/    # REST controllers
│       │   ├── config/        # Security & JWT config
│       │   └── dto/           # Data transfer objects
│       └── src/main/resources/
│           └── application.yml
├── frontend/
│   └── src/
│       ├── components/        # React components
│       ├── pages/            # Page components
│       ├── services/         # API services
│       ├── context/          # Auth context
│       └── App.jsx           # Main app with routing
├── database/
│   ├── migrations/           # Database schema
│   └── seeds/               # Sample data
└── docker-compose.yml       # Docker configuration
```

## Troubleshooting

### Backend won't start
1. Check Java version: `java -version` (should be 17)
2. Check if port 8081 is free: `netstat -ano | findstr :8081`
3. Verify PostgreSQL is running: `docker ps`
4. Check logs: Look at console output for errors

### Frontend won't start
1. Check Node version: `node -v` (should be 20+)
2. Install dependencies: `npm install`
3. Check if port 5173 is free
4. Verify .env file exists with correct API URL

### Database connection errors
1. Check Docker container: `docker ps`
2. Verify database exists: 
   ```powershell
   docker exec -it scms-postgres-1 psql -U postgres -c "\l"
   ```
3. Check application.yml has correct credentials

### Login fails
1. Verify backend is running on port 8081
2. Check browser console for errors (F12)
3. Verify database has seed data:
   ```powershell
   docker exec -it scms-postgres-1 psql -U postgres -d scms_users -c "SELECT * FROM users;"
   ```

## Development Notes

### BCrypt Password Hashing
All passwords are hashed with BCrypt. The hash for "password123" is:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

### File Upload Location
Assignment files are stored in: `backend/user-service/uploads/assignments/`

### JWT Token Expiry
Tokens expire after 24 hours (configured in application.yml)

## Next Steps (Not Implemented Yet)

- [ ] Course enrollment functionality
- [ ] Fee payment integration
- [ ] Notification system
- [ ] Analytics dashboard
- [ ] Report generation (PDF)
- [ ] Mobile app (React Native)
- [ ] API Gateway for microservices
- [ ] Redis caching
- [ ] AWS deployment

## Team Members
- Abhijith S Unni (02) - Backend Lead
- Jacob Biju (35) - Frontend Lead
- Arjun Sathyam (74) - LMS & Integrations
- Rajesh Krishna (76) - DevOps & Analytics

## License
College of Engineering Trivandrum | PECST411 | Academic Year 2025-2026
