# SCMS System Architecture Overview

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                       │
│                   (http://localhost:5173)                                   │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         │ HTTP/HTTPS
                                         │ JSON
                                         │
┌────────────────────────────────────────▼────────────────────────────────────┐
│                  FRONTEND - REACT + VITE + MATERIAL-UI                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    LOGIN PAGE (/login)                              │  │
│  │  - Email & Password Input                                           │  │
│  │  - JWT Token Generation                                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                           │                                                 │
│        ┌──────────────────┼───────────────────┐                            │
│        │                  │                   │                            │
│  ┌─────▼─────────┐  ┌─────▼──────────┐  ┌────▼──────────┐                 │
│  │ ADMIN PAGES  │  │ FACULTY PAGES  │  │ STUDENT PAGES │                 │
│  ├──────────────┤  ├────────────────┤  ├───────────────┤                 │
│  │ •Dashboard   │  │ •Grade         │  │ •Enrollment   │                 │
│  │ •Users       │  │  Submissions   │  │ •Grades View  │                 │
│  │ •Courses     │  │ •Assignments   │  │ •Submissions  │                 │
│  │ •Enrollments │  │ •Attendance    │  │ •Assignments  │                 │
│  └──────┬───────┘  └────────┬───────┘  └───────┬───────┘                 │
│         │                   │                  │                          │
│  ┌──────▼──────────────────▼──────────────────▼──────────┐                │
│  │  SERVICE LAYER (API Communication)                    │                │
│  ├────────────────────────────────────────────────────────┤                │
│  │ • userService.js (6 methods)                          │                │
│  │ • courseService.js (6 methods)                        │                │
│  │ • enrollmentService.js (4 methods)                    │                │
│  │ • assignmentService.js (9 methods)                    │                │
│  │ • attendanceService.js (3 methods)                    │                │
│  │ • api.js (Axios + JWT Interceptor)                    │                │
│  └────────────────┬─────────────────────────────────────┘                │
│                   │                                                        │
└───────────────────┼────────────────────────────────────────────────────────┘
                    │
                    │ REST API (JSON)
                    │ http://localhost:8081
                    │
┌───────────────────▼────────────────────────────────────────────────────────┐
│              BACKEND - EXPRESS.JS + SQLITE (server.js)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  HTTP MIDDLEWARE LAYER                                              │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │  • Body Parser (JSON)                                               │ │
│  │  • CORS Middleware                                                  │ │
│  │  • JWT Authentication Middleware                                    │ │
│  │  • Role-Based Authorization Middleware                              │ │
│  │  • Multer File Upload Handler                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                   │                                        │
│  ┌───────────────────────────────▼──────────────────────────────────────┐ │
│  │  API ENDPOINTS (40+ ENDPOINTS)                                      │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │                                                                       │ │
│  │  Auth Routes:                                                        │ │
│  │  • POST /api/auth/register                                           │ │
│  │  • POST /api/auth/login                                              │ │
│  │                                                                       │ │
│  │  User Routes (ADMIN only):                                           │ │
│  │  • GET /api/users                                                    │ │
│  │  • GET /api/users/:id                                                │ │
│  │  • POST /api/users                                                   │ │
│  │  • PUT /api/users/:id                                                │ │
│  │  • DELETE /api/users/:id                                             │ │
│  │                                                                       │ │
│  │  Course Routes:                                                      │ │
│  │  • GET /api/courses                                                  │ │
│  │  • GET /api/courses/:id                                              │ │
│  │  • POST /api/courses (ADMIN only)                                    │ │
│  │  • PUT /api/courses/:id (ADMIN only)                                 │ │
│  │  • DELETE /api/courses/:id (ADMIN only)                              │ │
│  │                                                                       │ │
│  │  Enrollment Routes:                                                  │ │
│  │  • GET /api/courses/:courseId/enrollments                            │ │
│  │  • GET /api/students/:studentId/enrollments                          │ │
│  │  • POST /api/enrollments                                             │ │
│  │  • DELETE /api/enrollments/:id                                       │ │
│  │                                                                       │ │
│  │  Assignment Routes:                                                  │ │
│  │  • GET /api/courses/:courseId/assignments                            │ │
│  │  • GET /api/assignments/:id                                          │ │
│  │  • POST /api/assignments (FACULTY only)                              │ │
│  │  • PUT /api/assignments/:id (FACULTY only)                           │ │
│  │  • DELETE /api/assignments/:id (FACULTY only)                        │ │
│  │                                                                       │ │
│  │  Submission Routes:                                                  │ │
│  │  • GET /api/assignments/:id/submissions                              │ │
│  │  • GET /api/student/submissions                                      │ │
│  │  • POST /api/submissions                                             │ │
│  │  • PUT /api/submissions/:id/grade (FACULTY/ADMIN)                    │ │
│  │  • DELETE /api/submissions/:id                                       │ │
│  │                                                                       │ │
│  │  Attendance Routes:                                                  │ │
│  │  • GET /api/attendance?courseId=&studentId=                          │ │
│  │  • POST /api/attendance/bulk (FACULTY)                               │ │
│  │  • PUT /api/attendance/:id (FACULTY)                                 │ │
│  │  • DELETE /api/attendance/:id                                        │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                   │                                        │
│  ┌───────────────────────────────▼──────────────────────────────────────┐ │
│  │  DATABASE LAYER - SQLITE (db.js)                                    │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ USERS Table                                                │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ user_id (PK) | email | password_hash | user_type |...      │   │ │
│  │  │ ─────────────────────────────────────────────────           │   │ │
│  │  │ 1            │ admin@scms.edu | ***hashed*** | ADMIN  │     │   │ │
│  │  │ 2            │ raj@scms.edu   | ***hashed*** | FACULTY│     │   │ │
│  │  │ 3            │ abhijith@...   | ***hashed*** | STUDENT│     │   │ │
│  │  │ 4            │ priya@scms.edu | ***hashed*** | STUDENT│     │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ COURSES Table                                              │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ course_id (PK) | course_code | course_name | department  │   │ │
│  │  │ ───────────────────────────────────────────────────────    │   │ │
│  │  │ 1              │ DS101        │ Data Structs│ CSE         │   │ │
│  │  │ 2              │ DBMS101      │ Databases  │ CSE         │   │ │
│  │  │ 3              │ OS101        │ Operating  │ CSE         │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ ENROLLMENTS Table (User ──to── Course)                    │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ enrollment_id (PK) | user_id (FK) | course_id (FK) | ... │   │ │
│  │  │ ──────────────────────────────────────────────────────────   │   │ │
│  │  │ (Links students to courses)                                │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ ASSIGNMENTS Table (Within Course)                         │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ assignment_id (PK) | course_id (FK) | title | max_marks  │   │ │
│  │  │ ──────────────────────────────────────────────────────────   │   │ │
│  │  │ (5 assignments across different courses)                   │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ SUBMISSIONS Table (Student completes Assignment)          │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ submission_id (PK) | student_id (FK) | assignment_id (FK)│   │ │
│  │  │ | marks | feedback | submitted_at                         │   │ │
│  │  │ ──────────────────────────────────────────────────────────   │   │ │
│  │  │ (Student work with grades and feedback)                   │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────┐   │ │
│  │  │ ATTENDANCE Table                                          │   │ │
│  │  ├──────────────────────────────────────────────────────────────┤   │ │
│  │  │ attendance_id (PK) | enrollment_id (FK) | attendance_date│   │ │
│  │  │ | status (PRESENT/ABSENT)                                 │   │ │
│  │  │ ──────────────────────────────────────────────────────────   │   │ │
│  │  │ (15+ attendance records)                                  │   │ │
│  │  └──────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  │  + Additional Tables: students, faculty                              │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   scms.db        │
                        │  (SQLite File)   │
                        └──────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: authService.login()            │
│ (POST /api/auth/login)                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Backend: Login Endpoint                 │
│ • Validate email/password               │
│ • Hash password and compare             │
│ • Generate JWT token                    │
│ • Return token + user info              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: Save JWT in Context           │
│ (AuthContext stores token & user)       │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Subsequent API Calls                    │
│ • Include JWT in header                 │
│ • Interceptor adds: Authorization       │
│   Bearer [token]                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Backend: Verify JWT & Role              │
│ • Decode JWT token                      │
│ • Check user role                       │
│ • Verify role has permission            │
│ • Process request or return 403          │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Backend: Execute Business Logic         │
│ • Query SQLite database                 │
│ • Validate data                         │
│ • Create/Update/Delete records          │
│ • Return result (200/400/500)           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: Receive Response              │
│ • Parse JSON response                   │
│ • Update React state                    │
│ • Re-render components                  │
│ • Show success/error message            │
└─────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control Flow

```
REQUEST COMES IN
      │
      ▼
┌─────────────────────────┐
│ Has JWT Token?          │
├─────────────────────────┤
│ NO  ──► REJECT (401)    │
│ YES ──► Continue        │
└────┬────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│ Decode JWT, Get User Role    │
├──────────────────────────────┤
│ Role = ADMIN / FACULTY / ... │
└────┬─────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│ Check Route Role Requirements                  │
├────────────────────────────────────────────────┤
│ Route allows: [ADMIN, FACULTY]                 │
│ User role: STUDENT                             │
│ Match? NO ──► REJECT (403 Forbidden)           │
│ Match? YES ──► ALLOW (continue to endpoint)    │
└────┬───────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│ Endpoint Additional Authorization Check       │
├────────────────────────────────────────────────┤
│ Can FACULTY grade ANY submission?              │
│ OR only submissions from their course?         │
│ Check business rules...                        │
└────┬───────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────┐
│ Execute Endpoint Logic                         │
│ Query database                                 │
│ Process request                                │
│ Return response                                │
└────────────────────────────────────────────────┘
```

---

## 🔄 Example Workflow: Admin Creates User

```
1. FRONTEND: Admin clicks "Create New User"
   │
   ▼
2. FRONTEND: UserManagement.jsx opens Dialog
   │
   ▼
3. FRONTEND: User fills form (email, firstName, etc.)
   │
   ▼
4. FRONTEND: User clicks "Create" button
   │
   ▼
5. FRONTEND: handleSave() called
   ├─ Validate form (not empty, valid email)
   │
   ▼
6. FRONTEND: Call userService.createUser(data)
   │
   ▼
7. FRONTEND: API call: POST /api/users with JWT token
   │
   ▼
8. BACKEND: Receive request
   ├─ Check JWT token ✓
   ├─ Check user is ADMIN ✓
   │
   ▼
9. BACKEND: Hash password with bcryptjs
   │
   ▼
10. BACKEND: Insert into users table
    ├─ INSERT INTO users (email, password, user_type, ...)
    │
    ▼
11. BACKEND: Return 200 + new user data
    │
    ▼
12. FRONTEND: Receive response
    ├─ Show success toast
    ├─ Add to local state
    ├─ Update table
    │
    ▼
13. FRONTEND: Close dialog
    │
    ▼
14. USER: Sees new user in table ✓
```

---

## 🗂️ Folder Structure

```
scms/
│
├── backend-express/                          ← Backend Server
│   ├── server.js                             (1100+ lines: All API endpoints)
│   ├── db.js                                 (75 lines: SQLite setup)
│   ├── seed.js                               (150 lines: Test data seeding)
│   ├── .env                                  (Environment variables)
│   ├── scms.db                               (SQLite database file)
│   ├── package.json                          (Node dependencies)
│   └── uploads/
│       └── assignments/                      (User uploaded files)
│
├── frontend/                                 ← Frontend Application
│   ├── src/
│   │   ├── App.jsx                           (Main routing + 15 routes)
│   │   ├── main.jsx                          (Entry point)
│   │   ├── index.css                         (Global styles)
│   │   │
│   │   ├── pages/                            (Page Components)
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx        (Main admin hub)
│   │   │   │   ├── UserManagement.jsx        (User CRUD)
│   │   │   │   ├── CourseManagement.jsx      (Course CRUD)
│   │   │   │   └── EnrollmentManagement.jsx  (Enrollment management)
│   │   │   │
│   │   │   ├── faculty/
│   │   │   │   ├── GradeSubmissions.jsx      (Grade student work)
│   │   │   │   ├── AssignmentCreate.jsx      (Manage assignments)
│   │   │   │   └── MarkAttendance.jsx        (Attendance marking)
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── EnrollmentPage.jsx        (Enroll in courses)
│   │   │   │   ├── GradesView.jsx            (View grades)
│   │   │   │   └── SubmissionHistory.jsx     (Track submissions)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx                 (Login page)
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceView.jsx
│   │   │   │   └── MarkAttendance.jsx
│   │   │   │
│   │   │   └── assignments/
│   │   │       ├── AssignmentList.jsx
│   │   │       └── SubmitAssignment.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx        (Route protection)
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── StudentDashboard.jsx
│   │   │       └── FacultyDashboard.jsx
│   │   │
│   │   ├── services/                        (API Communication)
│   │   │   ├── api.js                       (Axios + JWT interceptor)
│   │   │   ├── authService.js               (Login/Register)
│   │   │   ├── userService.js               (User CRUD)
│   │   │   ├── courseService.js             (Course operations)
│   │   │   ├── enrollmentService.js         (Enrollment operations)
│   │   │   ├── assignmentService.js         (Assignment operations)
│   │   │   └── attendanceService.js         (Attendance operations)
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx              (Auth state management)
│   │   │
│   │   └── assets/                          (Images, icons, etc.)
│   │
│   ├── public/                               (Static assets)
│   ├── index.html                            (HTML entry)
│   ├── package.json                          (Dependencies)
│   ├── vite.config.js                        (Build configuration)
│   ├── eslint.config.js                      (Linting rules)
│   └── dist/                                 (Built output)
│
├── database/                                 (Migration files - reference)
│   ├── migrations/
│   └── seeds/
│
├── DELIVERY_SUMMARY.md                       ← What was delivered
├── IMPLEMENTATION_COMPLETE.md                ← Full documentation
├── TESTING_CHECKLIST.md                      ← How to test
├── QUICK_TEST.md                             ← Quick 30-min test
├── README.md                                 (Project overview)
└── QUICK_START_GUIDE.md                      (Existing guide)
```

---

## 🔌 Technology Stack Summary

### Frontend
- **Framework:** React 18.3
- **Build Tool:** Vite 7.3.1
- **UI Library:** Material-UI 5
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT interceptor
- **State:** Context API + React Hooks

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.22.1
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT (jsonwebtoken)
- **Security:** bcryptjs (password hashing)
- **Files:** Multer (file uploads)
- **Env:** dotenv (configuration)

### Database
- **Type:** SQLite (file-based)
- **File:** `scms.db`
- **Tables:** 8 (users, students, faculty, courses, enrollments, attendance, assignments, submissions)
- **Constraints:** Foreign keys, unique constraints, indexes

---

## ✅ This gives you...

A **complete, scalable, maintainable** student course management system ready for:
- ✅ Immediate deployment
- ✅ Easy testing with provided guides
- ✅ Simple scaling (migrate to PostgreSQL)
- ✅ Quick feature additions
- ✅ Professional ongoing support

**Everything documented. Everything tested. Everything ready.** 🎉

