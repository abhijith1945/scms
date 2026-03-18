const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads/assignments')) {
  fs.mkdirSync('uploads/assignments', { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===== JWT Middleware =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// ===== AUTH ENDPOINTS =====

// LOGIN
// Helper to convert snake_case to camelCase
const snakeToCamel = (obj) => {
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (m) => m[1].toUpperCase());
    converted[camelKey] = value;
  }
  return converted;
};

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Accept plain password "password123" for testing
    const validPassword = password === 'password123';
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get additional user info based on type
    let userProfile = { ...user };
    if (user.user_type === 'STUDENT') {
      const student = db.prepare('SELECT * FROM students WHERE student_id = ?').get(user.user_id);
      userProfile = { ...user, ...student };
    } else if (user.user_type === 'FACULTY') {
      const faculty = db.prepare('SELECT * FROM faculty WHERE faculty_id = ?').get(user.user_id);
      userProfile = { ...user, ...faculty };
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = userProfile;
    const userCamelCase = snakeToCamel(userWithoutPassword);
    console.log('Login successful for:', email);
    res.json({ token, user: userCamelCase });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// REGISTER
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, user_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(email, passwordHash, firstName || '', lastName || '', userType || 'STUDENT');
    const newUser = db.prepare('SELECT * FROM users WHERE user_id = ?').get(result.lastInsertRowid);

    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email, userType: newUser.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = newUser;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== USER ENDPOINTS =====

// GET ALL USERS (Admin only)
app.get('/api/users', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const users = db.prepare('SELECT user_id, email, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active FROM users').all();
    res.json(users.map(u => snakeToCamel(u)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET USER BY ID
app.get('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT user_id, email, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active FROM users WHERE user_id = ?').get(id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(snakeToCamel(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE USER (Admin only)
app.post('/api/users', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber, dateOfBirth, gender, address, userType } = req.body;

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Use default password "password123" hashed
    const passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(email, passwordHash, firstName, lastName, phoneNumber, dateOfBirth, gender, address, userType);
    const newUser = db.prepare('SELECT * FROM users WHERE user_id = ?').get(result.lastInsertRowid);

    const { password_hash, ...userWithoutPassword } = newUser;
    res.json({ message: 'User created successfully', user: snakeToCamel(userWithoutPassword) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE USER (Self or Admin)
app.put('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, dateOfBirth, gender, address } = req.body;

    // Check authorization
    if (req.user.userId !== parseInt(id) && req.user.userType !== 'ADMIN') {
      return res.status(403).json({ message: 'Cannot update other users' });
    }

    const stmt = db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?, gender = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);

    stmt.run(firstName, lastName, phoneNumber, dateOfBirth, gender, address, id);
    const updatedUser = db.prepare('SELECT * FROM users WHERE user_id = ?').get(id);

    const { password_hash, ...userWithoutPassword } = updatedUser;
    res.json({ message: 'User updated', user: snakeToCamel(userWithoutPassword) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE USER (Admin only)
app.delete('/api/users/:id', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM users WHERE user_id = ?').run(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== COURSE ENDPOINTS =====

// GET ALL COURSES
app.get('/api/courses', authenticateToken, (req, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses WHERE is_active = 1').all();
    res.json(courses.map(c => snakeToCamel(c)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ENROLLED COURSES (Student only)
app.get('/api/courses/enrolled', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT c.* FROM courses c
      JOIN enrollments e ON c.course_id = e.course_id
      WHERE e.student_id = ? AND e.status = 'ACTIVE'
    `).all(req.user.userId);

    res.json(courses.map(c => snakeToCamel(c)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET COURSE BY ID
app.get('/api/courses/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const course = db.prepare('SELECT * FROM courses WHERE course_id = ?').get(id);
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(snakeToCamel(course));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE COURSE (Admin/Faculty)
app.post('/api/courses', authenticateToken, authorize(['ADMIN', 'FACULTY']), (req, res) => {
  try {
    const { courseCode, courseName, department, credits, semester, maxCapacity, description } = req.body;

    const stmt = db.prepare(`
      INSERT INTO courses (course_code, course_name, department, credits, semester, max_capacity, description, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const facultyId = req.user.userType === 'FACULTY' ? req.user.userId : null;
    const result = stmt.run(courseCode, courseName, department, credits, semester, maxCapacity, description, facultyId);
    const newCourse = db.prepare('SELECT * FROM courses WHERE course_id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Course created', course: snakeToCamel(newCourse) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE COURSE (Admin/Course Owner)
app.put('/api/courses/:id', authenticateToken, authorize(['ADMIN', 'FACULTY']), (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, department, credits, semester, maxCapacity, description, facultyId } = req.body;

    // Check if faculty owns the course
    const course = db.prepare('SELECT * FROM courses WHERE course_id = ?').get(id);
    if (req.user.userType === 'FACULTY' && course.faculty_id !== req.user.userId) {
      return res.status(403).json({ message: 'Cannot edit course you don\'t own' });
    }

    const stmt = db.prepare(`
      UPDATE courses 
      SET course_name = ?, department = ?, credits = ?, semester = ?, max_capacity = ?, description = ?, faculty_id = ?
      WHERE course_id = ?
    `);

    stmt.run(courseName, department, credits, semester, maxCapacity, description, facultyId, id);
    const updatedCourse = db.prepare('SELECT * FROM courses WHERE course_id = ?').get(id);

    res.json({ message: 'Course updated', course: snakeToCamel(updatedCourse) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE COURSE (Admin only)
app.delete('/api/courses/:id', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM courses WHERE course_id = ?').run(id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ENROLLMENT ENDPOINTS =====

// GET ENROLLMENTS FOR COURSE (Faculty only)
app.get('/api/enrollments/course/:courseId', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = db.prepare(`
      SELECT e.*, u.first_name, u.last_name, u.email, s.enrollment_no
      FROM enrollments e
      JOIN users u ON e.student_id = u.user_id
      JOIN students s ON e.student_id = s.student_id
      WHERE e.course_id = ? AND e.status = 'ACTIVE'
    `).all(courseId);

    res.json(enrollments.map(e => snakeToCamel(e)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET STUDENT'S ENROLLMENTS
app.get('/api/enrollments/student/:studentId', authenticateToken, (req, res) => {
  try {
    const { studentId } = req.params;
    
    const enrollments = db.prepare(`
      SELECT e.*, c.course_name, c.course_code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = ?
    `).all(studentId);

    res.json(enrollments.map(e => snakeToCamel(e)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE ENROLLMENT (Student enrolls in course)
app.post('/api/enrollments', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existing = db.prepare('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?').get(req.user.userId, courseId);
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const stmt = db.prepare(`
      INSERT INTO enrollments (student_id, course_id, status)
      VALUES (?, ?, 'ACTIVE')
    `);

    const result = stmt.run(req.user.userId, courseId);
    const enrollment = db.prepare('SELECT * FROM enrollments WHERE enrollment_id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Enrolled successfully', enrollment: snakeToCamel(enrollment) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE ENROLLMENT (Drop course)
app.delete('/api/enrollments/:enrollmentId', authenticateToken, (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const enrollment = db.prepare('SELECT * FROM enrollments WHERE enrollment_id = ?').get(enrollmentId);

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Student can only drop their own, or admin can drop anyone
    if (req.user.userType !== 'ADMIN' && enrollment.student_id !== req.user.userId) {
      return res.status(403).json({ message: 'Cannot drop other students\' enrollments' });
    }

    db.prepare('DELETE FROM enrollments WHERE enrollment_id = ?').run(enrollmentId);
    res.json({ message: 'Dropped course successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ATTENDANCE ENDPOINTS =====

// GET ATTENDANCE FOR STUDENT (Student/Faculty/Admin)
app.get('/api/attendance/student/:studentId', authenticateToken, (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    let query = `
      SELECT a.*, c.course_name FROM attendance a
      JOIN courses c ON a.course_id = c.course_id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }

    const attendance = db.prepare(query).all(...params);
    res.json(attendance.map(a => snakeToCamel(a)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET MY ATTENDANCE (Student only)
app.get('/api/attendance/me', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const attendanceRecords = db.prepare(`
      SELECT a.*, c.course_name FROM attendance a
      JOIN courses c ON a.course_id = c.course_id
      WHERE a.student_id = ?
    `).all(req.user.userId);

    // Calculate percentages by course
    const courseStats = {};
    attendanceRecords.forEach(record => {
      if (!courseStats[record.course_id]) {
        courseStats[record.course_id] = {
          courseName: record.course_name,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      courseStats[record.course_id].total++;
      if (record.status === 'PRESENT') {
        courseStats[record.course_id].present++;
      } else {
        courseStats[record.course_id].absent++;
      }
    });

    // Calculate percentages
    Object.keys(courseStats).forEach(courseId => {
      const stats = courseStats[courseId];
      stats.percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    });

    res.json(courseStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// MARK ATTENDANCE (Faculty only)
app.post('/api/attendance/bulk', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const attendanceList = req.body;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO attendance (student_id, course_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    attendanceList.forEach(record => {
      stmt.run(record.studentId, record.courseId, record.date, record.status, req.user.userId);
    });

    res.json({ message: 'Attendance marked successfully', count: attendanceList.length, data: attendanceList.map(a => snakeToCamel(a)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE ATTENDANCE (Faculty only)
app.put('/api/attendance/:id', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const stmt = db.prepare('UPDATE attendance SET status = ? WHERE attendance_id = ?');
    stmt.run(status, id);

    const updated = db.prepare('SELECT * FROM attendance WHERE attendance_id = ?').get(id);
    res.json({ message: 'Attendance updated', attendance: snakeToCamel(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE ATTENDANCE (Faculty only)
app.delete('/api/attendance/:id', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM attendance WHERE attendance_id = ?').run(id);
    res.json({ message: 'Attendance deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ASSIGNMENT ENDPOINTS =====

// GET ASSIGNMENTS FOR COURSE
app.get('/api/assignments/course/:courseId', authenticateToken, (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = db.prepare(`
      SELECT a.*, c.course_name FROM assignments a
      JOIN courses c ON a.course_id = c.course_id
      WHERE a.course_id = ?
    `).all(courseId);

    res.json(assignments.map(a => snakeToCamel(a)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET MY ASSIGNMENTS (Student only)
app.get('/api/assignments/my', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const assignments = db.prepare(`
      SELECT a.*, c.course_name FROM assignments a
      JOIN courses c ON a.course_id = c.course_id
      JOIN enrollments e ON a.course_id = e.course_id
      WHERE e.student_id = ? AND e.status = 'ACTIVE'
    `).all(req.user.userId);

    // Add submission info
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = db.prepare(`
        SELECT * FROM submissions 
        WHERE assignment_id = ? AND student_id = ?
      `).get(assignment.assignment_id, req.user.userId);

      return {
        ...snakeToCamel(assignment),
        submitted: !!submission,
        submittedAt: submission?.submission_date,
        marksObtained: submission?.marks_obtained
      };
    });

    res.json(assignmentsWithSubmissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ASSIGNMENT BY ID
app.get('/api/assignments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const assignment = db.prepare(`
      SELECT a.*, c.course_name FROM assignments a
      JOIN courses c ON a.course_id = c.course_id
      WHERE a.assignment_id = ?
    `).get(id);

    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(snakeToCamel(assignment));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE ASSIGNMENT (Faculty only)
app.post('/api/assignments', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { courseId, title, description, dueDate, maxMarks } = req.body;

    const stmt = db.prepare(`
      INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(courseId, title, description, dueDate, maxMarks, req.user.userId);
    const assignment = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Assignment created', assignment: snakeToCamel(assignment) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE ASSIGNMENT (Faculty only)
app.put('/api/assignments/:id', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, maxMarks } = req.body;

    const stmt = db.prepare(`
      UPDATE assignments 
      SET title = ?, description = ?, due_date = ?, max_marks = ?
      WHERE assignment_id = ?
    `);

    stmt.run(title, description, dueDate, maxMarks, id);
    const updated = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(id);

    res.json({ message: 'Assignment updated', assignment: snakeToCamel(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE ASSIGNMENT (Faculty only)
app.delete('/api/assignments/:id', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM assignments WHERE assignment_id = ?').run(id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== SUBMISSION ENDPOINTS =====

// GET SUBMISSIONS FOR ASSIGNMENT (Faculty only)
app.get('/api/assignments/:assignmentId/submissions', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = db.prepare(`
      SELECT s.*, u.first_name, u.last_name, u.email, st.enrollment_no
      FROM submissions s
      JOIN students st ON s.student_id = st.student_id
      JOIN users u ON s.student_id = u.user_id
      WHERE s.assignment_id = ?
    `).all(assignmentId);

    res.json(submissions.map(s => snakeToCamel(s)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// SUBMIT ASSIGNMENT (Student only)
app.post('/api/assignments/:id/submit', authenticateToken, authorize(['STUDENT']), upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // Check if already submitted
    const existing = db.prepare('SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?').get(id, req.user.userId);
    if (existing) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    const stmt = db.prepare(`
      INSERT INTO submissions (assignment_id, student_id, file_path)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(id, req.user.userId, `/uploads/assignments/${file.filename}`);
    const submission = db.prepare('SELECT * FROM submissions WHERE submission_id = ?').get(result.lastInsertRowid);

    res.json({ message: 'Assignment submitted successfully', submission: snakeToCamel(submission) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GRADE SUBMISSION (Faculty only)
app.put('/api/submissions/:id', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    const { marksObtained, feedback } = req.body;

    const stmt = db.prepare(`
      UPDATE submissions 
      SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = CURRENT_TIMESTAMP
      WHERE submission_id = ?
    `);

    stmt.run(marksObtained, feedback, req.user.userId, id);
    const updated = db.prepare('SELECT * FROM submissions WHERE submission_id = ?').get(id);

    res.json({ message: 'Submission graded', submission: snakeToCamel(updated) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE SUBMISSION (Admin only)
app.delete('/api/submissions/:id', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM submissions WHERE submission_id = ?').run(id);
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SCMS Backend running on http://localhost:${PORT}`);
  console.log(`✅ Ready to accept requests`);
  console.log(`\n📝 Test credentials (password123):`);
  console.log(`   Admin: admin@scms.edu`);
  console.log(`   Faculty: faculty1@scms.edu`);
  console.log(`   Student: student1@scms.edu`);
  console.log(`   Student: student2@scms.edu`);
});

module.exports = app;
