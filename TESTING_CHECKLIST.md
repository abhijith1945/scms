# SCMS System - Comprehensive Testing Checklist

**Test Date:** March 18, 2026  
**System Status:** All 8 Phases Complete  
**Build Status:** ✅ Frontend builds successfully  
**Backend Status:** ✅ Running on port 8081

---

## 🧪 Testing Instructions

Use these credentials to test each role:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@scms.edu` | `password123` |
| Faculty | `raj@scms.edu` | `password123` |
| Student (1) | `abhijith@scms.edu` | `password123` |
| Student (2) | `priya@scms.edu` | `password123` |

---

## ✅ Phase 1-4: Admin Functionality (COMPLETED)

### Admin Dashboard (`/admin`)
- [ ] Login with `admin@scms.edu`
- [ ] Navigate to Admin Dashboard
- [ ] See drawer menu with options
- [ ] See three management cards (Users, Courses, Enrollments)
- [ ] Click each card to navigate to respective pages

### User Management (`/admin/users`)
- [ ] View all users in table format
- [ ] **Create User:**
  - [ ] Click "Create New User" button
  - [ ] Fill form: email, firstName, lastName, phone, dateOfBirth, gender, address, userType
  - [ ] Verify user appears in table
  - [ ] Verify in database: `SELECT * FROM users WHERE email=?;`
- [ ] **Edit User:**
  - [ ] Click edit icon on any user
  - [ ] Modify a field (e.g., phone number)
  - [ ] Save changes
  - [ ] Verify table updates
- [ ] **Delete User:**
  - [ ] Click delete icon
  - [ ] Confirm deletion
  - [ ] Verify user removed from table

### Course Management (`/admin/courses`)
- [ ] View all courses in table format
- [ ] **Create Course:**
  - [ ] Click "Create New Course" button
  - [ ] Fill form: courseCode, courseName, department, credits, semester, description
  - [ ] Verify course appears in table
  - [ ] Verify in database: `SELECT * FROM courses WHERE course_code=?;`
- [ ] **Edit Course:**
  - [ ] Edit credits field
  - [ ] Save and verify update
- [ ] **Delete Course:**
  - [ ] Delete a course
  - [ ] Verify removal from table

### Enrollment Management (`/admin/enrollments`)
- [ ] View courses in dropdown
- [ ] Select a course
- [ ] View all enrolled students
- [ ] **Drop Student:**
  - [ ] Click delete icon for a student
  - [ ] Confirm drop
  - [ ] Verify student removed from enrollment list
  - [ ] Verify in database: `SELECT * FROM enrollments WHERE enrollment_id=?;`

---

## ✅ Phase 5: Faculty Functionality (NEW - COMPLETED)

### Faculty Dashboard
- [ ] Login with `raj@scms.edu`
- [ ] See Faculty Dashboard (main dashboard)
- [ ] Verify role-based access

### Grade Submissions (`/faculty/grade-submissions`)
- [ ] View courses dropdown
- [ ] Select a course
- [ ] View assignments dropdown for selected course
- [ ] Select an assignment
- [ ] See submissions table with student names, emails, submission dates
- [ ] **Grade a Submission:**
  - [ ] Click "Grade" button on a submission
  - [ ] Enter marks (e.g., 18)
  - [ ] Enter feedback (e.g., "Good work!")
  - [ ] Save grade
  - [ ] Verify marks appear in table as green
  - [ ] Verify in database: `SELECT * FROM submissions WHERE marks IS NOT NULL;`
- [ ] **View Ungraded:**
  - [ ] Ungraded submissions show red "Not graded" text
  - [ ] After grading, change to green with marks

### Create Assignments (`/faculty/assignments`)
- [ ] View courses dropdown
- [ ] Select a course
- [ ] **Create Assignment:**
  - [ ] Click "+ New Assignment" button
  - [ ] Fill: title, description, dueDate, maxMarks
  - [ ] Example: "Midterm Project", "Build a web app", "2026-04-15", "100"
  - [ ] Save
  - [ ] Verify assignment appears in table
  - [ ] Verify in database: `SELECT * FROM assignments WHERE title=?;`
- [ ] **Edit Assignment:**
  - [ ] Click edit icon
  - [ ] Change maxMarks (e.g., to 120)
  - [ ] Save
  - [ ] Verify table updates
- [ ] **Delete Assignment:**
  - [ ] Click delete icon
  - [ ] Confirm
  - [ ] Verify removal

### Mark Attendance (`/attendance/mark`)
- [ ] View courses dropdown
- [ ] Select a course
- [ ] Select a date
- [ ] **Mark Present/Absent:**
  - [ ] Check boxes for students to mark present
  - [ ] View summary: "Present: X | Absent: Y | Total: Z"
  - [ ] Click "Mark All" - all checkboxes checked
  - [ ] Click "Clear All" - all unchecked
  - [ ] Check specific students
  - [ ] Click "Save Attendance"
  - [ ] Verify success message
  - [ ] Verify in database: `SELECT * FROM attendance WHERE attendance_date=?;`

---

## ✅ Phase 6: Student Functionality (NEW - COMPLETED)

### Student Dashboard
- [ ] Login with `abhijith@scms.edu`
- [ ] See Student Dashboard
- [ ] Verify role-based access

### Course Enrollment (`/student/enrollments`)
- [ ] **View Enrolled Courses:**
  - [ ] See table of enrolled courses (should have 3: Data Structures, DBMS, OS)
  - [ ] Each shows: code, name, department, credits, capacity
- [ ] **Drop Course:**
  - [ ] Click "Drop" button on a course
  - [ ] Confirm
  - [ ] Verify course removed from enrolled list
  - [ ] Verify appears in available courses list
- [ ] **Enroll in Course:**
  - [ ] Click "Enroll" on available course
  - [ ] Confirm dialog
  - [ ] Verify course moves to enrolled list
  - [ ] Verify in database: `SELECT * FROM enrollments WHERE user_id=?;`

### View Grades (`/student/grades`)
- [ ] **See Overall Performance:**
  - [ ] Total marks obtained / possible
  - [ ] Percentage shown
  - [ ] Average score with progress bar
- [ ] **Course-wise Performance:**
  - [ ] See cards for each enrolled course
  - [ ] Shows assignment count and percentage grade
- [ ] **Assignment Grades Table:**
  - [ ] Shows all assignments submitted
  - [ ] Displays: course, assignment, marks obtained, max marks, percentage
  - [ ] Graded assignments show in green
  - [ ] Ungraded show "Pending" in yellow
  - [ ] Shows feedback if available

### Submission History (`/student/submissions`)
- [ ] **See Summary:**
  - [ ] Total submissions count
  - [ ] Submitted count
  - [ ] Graded count
  - [ ] Pending grade count
- [ ] **View Submissions Table:**
  - [ ] Shows: course, assignment, due date, submitted date/time
  - [ ] Status badges (SUBMITTED, GRADED, PENDING)
  - [ ] Marks obtained with colored badge (green=excellent, blue=good, yellow=fair, red=poor)
  - [ ] Click "Details" for more info
- [ ] **View Submission Details:**
  - [ ] Click "Details" on any submission
  - [ ] Dialog shows:
    - [ ] Course code and name
    - [ ] Assignment title
    - [ ] Due date
    - [ ] Submission date/time
    - [ ] Marks obtained (if graded)
    - [ ] Feedback (if available)

### Assignment Submission (`/assignments/:id/submit`)
- [ ] View assignments list
- [ ] Click on assignment for a course
- [ ] See submit button
- [ ] Submit assignment (existing functionality)

---

## 🔍 Database Verification Tests

### Check Database Seeding
```sql
-- Check users exist
SELECT COUNT(*) as total_users FROM users;

-- Check courses exist  
SELECT COUNT(*) as total_courses FROM courses;

-- Check enrollments exist
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Check assignments exist
SELECT COUNT(*) as total_assignments FROM assignments;

-- Check submissions exist
SELECT COUNT(*) as total_submissions FROM submissions;

-- Verify test data
SELECT email, user_type FROM users;
SELECT course_code, course_name FROM courses LIMIT 3;
SELECT enrollment_id, user_id, course_id FROM enrollments LIMIT 5;
```

---

## 🚀 End-to-End Workflows

### Workflow 1: New Course Created by Admin, Faculty Assigns, Student Submits
1. [ ] Admin creates course "Web Development" (WEB101)
2. [ ] Faculty views new course in teaching list
3. [ ] Faculty creates assignment "Build Portfolio Website" for WEB101
4. [ ] Student enrolls in WEB101
5. [ ] Student sees assignment in assignment list
6. [ ] Student submits assignment
7. [ ] Faculty grades submission
8. [ ] Student views grade on Grades page

### Workflow 2: Student Enrollment Management
1. [ ] Student views enrolled courses (3 total)
2. [ ] Student drops one course
3. [ ] Verify enrollment count is now 2
4. [ ] Student enrolls in dropped course again
5. [ ] Verify enrollment count is back to 3
6. [ ] Verify database shows current enrollment correctly

### Workflow 3: Attendance Tracking
1. [ ] Faculty selects course and date
2. [ ] Faculty marks attendance for all students
3. [ ] Faculty saves
4. [ ] Verify in database: all students have attendance record for that date
5. [ ] Verify in database: status is either PRESENT or ABSENT

---

## 📊 Data Integrity Tests

- [ ] **Duplicate Prevention:** Try creating user with same email - should fail
- [ ] **Foreign Key Integrity:** Delete course - verify enrollments are handled
- [ ] **Cascading Deletes:** Delete user - verify related records are handled
- [ ] **Default Values:** New submission gets current timestamp
- [ ] **Field Validation:** Try entering negative max marks - should fail

---

## 🛡️ Security Tests

- [ ] **Role-Based Access:**
  - [ ] Student cannot access `/admin` routes
  - [ ] Faculty cannot access `/admin` routes
  - [ ] Admin cannot access `/student` routes
  - [ ] Admin cannot access `/faculty` routes
- [ ] **Authentication:**
  - [ ] Invalid login rejected
  - [ ] Valid login creates session
  - [ ] Logout clears session
  - [ ] Accessing protected route without login redirects to login
- [ ] **Token Expiry:** JWT token expires after 24 hours

---

## ✨ UI/UX Tests

- [ ] Material-UI components render correctly
- [ ] All buttons are clickable and functional
- [ ] All form inputs accept data
- [ ] Tables display data in proper format
- [ ] Responsive design (test on mobile view)
- [ ] Error messages display on failed operations
- [ ] Success messages display on successful operations
- [ ] Dialogs open and close properly
- [ ] Navigation between pages works

---

## 📝 Test Results Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Admin Dashboard | ⬜ | |
| User Management | ⬜ | |
| Course Management | ⬜ | |
| Enrollment Management | ⬜ | |
| Grade Submissions | ⬜ | |
| Create Assignments | ⬜ | |
| Mark Attendance | ⬜ | |
| Course Enrollment | ⬜ | |
| View Grades | ⬜ | |
| Submission History | ⬜ | |
| Database Integrity | ⬜ | |
| Security | ⬜ | |
| UI/UX | ⬜ | |

**Overall Status:** ⬜  
**Tested By:** [Your Name]  
**Date Tested:** [Date]

---

## Notes
- All test credentials have password: `password123`
- Database is SQLite at `backend-express/scms.db`
- Frontend runs on http://localhost:5173 (default dev server)
- Backend API at http://localhost:8081
