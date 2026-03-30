# Smart Campus Management System (SCMS) - Complete Flow Documentation

## System Overview
The SCMS is a complete academic management system with **3 user roles**: Admin, Faculty, and Students.

**Status**: ✅ FULLY OPERATIONAL AND TESTED

---

## Complete App Flow

### Phase 1: Admin Dashboard

#### 1.1 Admin Creates Faculty
1. Login as `admin@scms.edu` (password: `password123`)
2. Navigate to **Admin Dashboard → User Management**
3. Click **Add User**
4. Fill form:
   - Email: `newtacher@scms.edu`
   - First Name: `Prof`
   - Last Name: `Kumar`
   - Phone: `9876543210`
   - User Type: **FACULTY**
   - **Assign Courses**: Select courses (e.g., CS401, CS402)
5. Click **Create Teacher** → Faculty assigned to selected courses

#### 1.2 Admin Creates Students
1. Go to **User Management**
2. Click **Add Student**
3. Fill form:
   - Email: `newstudent@scms.edu`
   - First Name: `John`
   - Last Name: `Doe`
   - Phone: `9999999999`
   - User Type: **STUDENT**
   - **Assign Courses**: Select courses (e.g., CS401, CS402, CS403)
   - **Optional**: Assign Faculty (if multi-teacher support needed)
4. Click **Create Student** → Student enrolled in selected courses automatically

#### 1.3 Admin Creates Courses
1. Navigate to **Course Management**
2. Click **Add Course**
3. Fill form:
   - Course Code: `CS404`
   - Course Name: `Advanced Web Development`
   - Department: `Computer Science`
   - Credits: `4`
   - Semester: `4`
   - Max Capacity: `50`
   - Description: Course details
   - Faculty: Select faculty member (one teacher per course)
4. Click **Create Course**

#### 1.4 Admin Views Enrollment
1. Go to **Enrollment Management**
2. See all student-course enrollments
3. View:
   - Student Name & Email
   - Enrolled Courses
   - Enrollment Status
   - Date Enrolled

#### 1.5 Admin Deletes Student (Also deletes their data)
1. Go to **User Management**
2. Find student
3. Click **Delete** → All student data automatically cascades:
   - Enrollments deleted
   - Attendance records deleted
   - Submissions deleted
   - ✅ System maintains data integrity

---

### Phase 2: Faculty Operations

#### 2.1 Faculty Login & Dashboard
1. Login as `faculty1@scms.edu` (password: `password123`)
2. Faculty Dashboard shows:
   - Assigned Courses
   - Number of enrolled students per course
   - Quick actions

#### 2.2 Faculty Views Enrolled Students
1. Click on course name (e.g., "Data Structures")
2. View all enrolled students:
   - Student Name
   - Enrollment Number
   - Email
   - Enrollment Status

#### 2.3 Faculty Marks Attendance
1. Go to **Mark Attendance** page
2. Select:
   - Course: (dropdown of assigned courses)
   - Date: (pick date)
3. Table shows all enrolled students
4. For each student, mark:
   - **PRESENT** ✓
   - **ABSENT** ✗
   - **LATE** ⏱
5. **New Student Support**: Can add new students dynamically and mark attendance
6. Click **Submit Attendance** → All records saved

#### 2.4 Faculty Creates Assignments
1. Go to **Create Assignment**
2. Fill form:
   - Course: Select course
   - Title: `Binary Tree Implementation`
   - Description: Assignment details
   - Due Date: Date picker
   - Max Marks: `100`
3. Click **Create Assignment**

**Note**: Assignment automatically available to all students in that course

#### 2.5 Faculty Views Assignment Submissions
1. Go to **Grade Submissions**
2. Select Assignment from dropdown
3. View table:
   - Student Name & Email
   - Submission Status (Date/Not Submitted)
   - Uploaded File (if available)
   - Current Marks/Grade

#### 2.6 Faculty Grades Submissions
1. Click on student submission
2. View submitted file
3. Enter:
   - Marks Obtained: (e.g., 85)
   - Feedback: Written feedback
4. Click **Submit Grade** → Grade visible to student

#### 2.7 Faculty Updates/Deletes Assignment
1. Go to **Assignment List** for course
2. Click on assignment
3. Options:
   - **Edit**: Update title, description, due date, marks
   - **Delete**: Remove assignment (cascades delete submissions)

---

### Phase 3: Student Operations

#### 3.1 Student Login & Dashboard
1. Login as `student1@scms.edu` (password: `password123`)
2. Student Dashboard shows:
   - Enrolled Courses
   - Quick stats

#### 3.2 Student Views Courses
1. Go to **Enrollment Page**
2. View all enrolled courses:
   - Course Code
   - Course Name
   - Faculty Name
   - Credits
   - Semester

#### 3.3 Student Views Attendance
1. Go to **Check Attendance**
2. View attendance by course:
   - Total Classes
   - Present Count
   - Absent Count
   - **Attendance %** (calculated)
3. Date-wise breakdown available

#### 3.4 Student Views Assignments
1. Go to **Assignment List**
2. View all assignments for enrolled courses:
   - Assignment Title
   - Course Name
   - Due Date
   - **Status**: Submitted/Not Submitted
   - Marks (if graded)

#### 3.5 Student Submits Assignment
1. Click on assignment
2. **Submit Assignment** button
3. Choose file from computer
4. Click **Upload**
5. Confirmation shown

**Note**: Can only submit once; can't resubmit (prevents duplicate submissions)

#### 3.6 Student Views Grades
1. Go to **Grades View**
2. View all submissions and grades:
   - Assignment Name
   - Course Name
   - Submission Date
   - **Marks Obtained**
   - Faculty Feedback

#### 3.7 Student Views Submission History
1. Go to **Submission History**
2. View all submitted assignments:
   - Assignment Details
   - Submission Timestamp
   - Grade Status (Graded/Pending)
   - Feedback from faculty

---

## Key Features & Workflows

### ✅ Feature: Create Student with Course Assignment (Key Requirement)
**Admin Flow:**
```
Admin → Create User → Select STUDENT → Assign Courses (Multi-select) 
→ Backend: Creates user + enrolls in courses → Student auto-enrolled
```

### ✅ Feature: Create Faculty with Course Assignment
**Admin Flow:**
```
Admin → Create User → Select FACULTY → Assign Courses (Multi-select)
→ Backend: Faculty assigned to course (one teacher per course)
```

### ✅ Feature: Dynamic Attendance (Add New Students)
**Faculty can:**
- Mark attendance for existing students
- Add new students dynamically to course
- Mark attendance for new students immediately

### ✅ Feature: Assignment CRUD
- **Create**: Faculty creates with title, description, due date, max marks
- **Read**: All students in course see assignment
- **Update**: Faculty can edit assignment details
- **Delete**: Faculty deletes assignment (cascades delete submissions)

### ✅ Feature: Submission Tracking
- Faculty views all student submissions
- See which students submitted/didn't submit
- Grade each submission with marks & feedback
- Student sees grade and feedback

### ✅ Feature: Data Cascade (Delete Student)
When admin deletes a student:
- User account deleted
- All enrollments deleted
- All attendance records deleted
- All submissions deleted
- ✅ System maintains referential integrity

---

## API Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | /api/auth/login | All | Login |
| GET | /api/users | Admin | List all users |
| POST | /api/users | Admin | Create user (with courseIds) |
| PUT | /api/users/:id | Admin/Self | Update user |
| DELETE | /api/users/:id | Admin | Delete user |
| GET | /api/courses | All | List courses |
| POST | /api/courses | Admin/Faculty | Create course |
| GET | /api/enrollments/course/:courseId | Faculty | View enrolled students |
| POST | /api/enrollments | Student | Enroll in course |
| DELETE | /api/enrollments/:id | Student/Admin | Drop course |
| POST | /api/attendance/bulk | Faculty | Mark attendance |
| GET | /api/attendance/me | Student | View own attendance |
| POST | /api/assignments | Faculty | Create assignment |
| GET | /api/assignments/my | Student | View assignments |
| POST | /api/assignments/:id/submit | Student | Submit assignment |
| GET | /api/assignments/:id/submissions | Faculty | View submissions |
| PUT | /api/submissions/:id | Faculty | Grade submission |

---

## Test Data (Pre-populated)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scms.edu | password123 |
| Faculty1 | faculty1@scms.edu | password123 |
| Faculty2 | faculty2@scms.edu | password123 |
| Student1 | student1@scms.edu | password123 |
| Student2 | student2@scms.edu | password123 |

**Courses:**
- CS401: Data Structures (Faculty: Rajesh Kumar)
- CS402: Database Management Systems (Faculty: Rajesh Kumar)
- CS403: Web Technologies (Faculty: Priya Sharma)

---

## System Architecture

### Frontend (React + Vite)
- Port: **5173**
- URL: `http://localhost:5173`
- Pages: Login, Dashboards, User/Course/Enrollment Management, Attendance, Assignments

### Backend (Express.js + SQLite)
- Port: **8081**
- Base URL: `http://localhost:8081/api`
- Database: `scms.db` (auto-created)

### Database (SQLite)
- Tables: users, students, faculty, courses, enrollments, attendance, assignments, submissions
- Foreign Key Constraints: Enabled
- Cascade Deletes: Enabled

---

## Complete Workflow Example

### Scenario: New Student Joins Mid-Semester

**Step 1: Admin Creates Student**
```
Admin logs in
→ User Management
→ Add User (Email: newtjan@scms.edu, Type: STUDENT)
→ Assign to courses: CS401, CS402
→ Create
Result: Student auto-enrolled in CS401 & CS402
```

**Step 2: Faculty Marks Attendance**
```
Faculty logs in
→ Mark Attendance
→ Select Course: CS401
→ Select Date: Today
→ See new student in list
→ Mark: PRESENT
→ Submit
Result: Attendance recorded for new student
```

**Step 3: Faculty Creates Assignment**
```
Faculty still on Attendance page
→ Create Assignment
→ Course: CS401
→ Title: Algorithm Task
→ Due Date: 7 days
→ Create
Result: Assignment visible next day to all enrolled students
```

**Step 4: New Student Logs In**
```
New student logs in
→ Assignment List → See "Algorithm Task"
→ Click Submit
→ Upload file
→ Submit
Result: Submission recorded
```

**Step 5: Faculty Grades**
```
Faculty logs in
→ Grade Submissions
→ Select Assignment: Algorithm Task
→ See new student's submission
→ Enter Marks: 88
→ Add Feedback
→ Submit Grade
Result: Grade visible to student with feedback
```

**Step 6: Student Views Grade**
```
Student logs in
→ Grades View
→ See: "Algorithm Task": 88/100, Feedback: "Good work"
Result: Student sees feedback and grade
```

---

## System is Ready for Production

✅ All CRUD operations working
✅ Role-based access control enforced
✅ Data cascade on delete
✅ Multi-course support
✅ Dynamic student addition to courses
✅ Assignment submission & grading
✅ Attendance tracking
✅ API fully tested
✅ Frontend fully integrated
✅ Database with proper schema

**Start using the system**: http://localhost:5173
