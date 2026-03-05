# Smart Campus Management System (SCMS)

College of Engineering Trivandrum - Software Engineering Project

## Team Members
- Abhijith S Unni (02)
- Jacob Biju (35)
- Arjun Sathyam (74)
- Rajesh Krishna (76)

## Tech Stack
- **Backend**: Java 17 + Spring Boot 3.x
- **Frontend**: React.js + Material-UI
- **Database**: PostgreSQL 15
- **Authentication**: JWT
- **Containerization**: Docker

## Features
- User Authentication (Student, Faculty, Admin)
- Course Management
- Attendance Tracking
- Assignment Submission & Grading

## Quick Start

### Prerequisites
- Java 17 JDK
- Node.js 20 LTS
- Maven 3.9+
- Docker Desktop

### Setup

1. **Start Database**
```bash
docker-compose up -d
```

2. **Run Backend**
```bash
cd backend/user-service
mvn spring-boot:run
```

3. **Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Access URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8081
- pgAdmin: http://localhost:5050

### Default Credentials
- Admin: admin@scms.edu / admin123
- Student: student1@scms.edu / student123
- Faculty: faculty1@scms.edu / faculty123

## Project Structure
```
scms/
├── backend/user-service/    # Spring Boot application
├── frontend/                # React application
├── database/                # SQL scripts
└── docker-compose.yml       # Docker configuration
```

## Development Timeline
Phase 1 (Current): Authentication, Courses, Attendance, Assignments
