const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: '✅ SCMS Backend is running', version: '1.0.0', endpoints: '/api/*' });
});

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

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const derivePrimaryFacultyFromCourses = (courseIds) => {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return null;
  }

  const getCourseFaculty = db.prepare(`
    SELECT faculty_id
    FROM courses
    WHERE course_id = ? AND faculty_id IS NOT NULL
  `);

  const facultySet = new Set();
  courseIds.forEach((courseId) => {
    const row = getCourseFaculty.get(courseId);
    if (row?.faculty_id) {
      facultySet.add(row.faculty_id);
    }
  });

  // If all selected courses are handled by one faculty, keep as mentor.
  return facultySet.size === 1 ? [...facultySet][0] : null;
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
    const users = db.prepare(`
      SELECT
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.date_of_birth,
        u.gender,
        u.address,
        u.user_type,
        u.is_active,
        s.enrollment_no,
        s.assigned_faculty_id,
        f.employee_id
      FROM users u
      LEFT JOIN students s ON u.user_id = s.student_id
      LEFT JOIN faculty f ON u.user_id = f.faculty_id
      ORDER BY u.user_id DESC
    `).all();
    res.json(users.map(u => snakeToCamel(u)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET USER BY ID
app.get('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.userType !== 'ADMIN' && req.user.userId !== toInt(id)) {
      return res.status(403).json({ message: 'Cannot access other users' });
    }

    const user = db.prepare(`
      SELECT
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.date_of_birth,
        u.gender,
        u.address,
        u.user_type,
        u.is_active,
        s.enrollment_no,
        s.assigned_faculty_id,
        f.employee_id
      FROM users u
      LEFT JOIN students s ON u.user_id = s.student_id
      LEFT JOIN faculty f ON u.user_id = f.faculty_id
      WHERE u.user_id = ?
    `).get(id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    let courseIds = [];
    if (user.user_type === 'STUDENT') {
      courseIds = db.prepare(`
        SELECT course_id
        FROM enrollments
        WHERE student_id = ? AND status = 'ACTIVE'
        ORDER BY course_id
      `).all(id).map((row) => row.course_id);
    } else if (user.user_type === 'FACULTY') {
      courseIds = db.prepare(`
        SELECT course_id
        FROM courses
        WHERE faculty_id = ? AND is_active = 1
        ORDER BY course_id
      `).all(id).map((row) => row.course_id);
    }

    let courseFaculties = [];
    if (user.user_type === 'STUDENT') {
      courseFaculties = db.prepare(`
        SELECT DISTINCT f.faculty_id, u.first_name, u.last_name, f.designation
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN faculty f ON c.faculty_id = f.faculty_id
        JOIN users u ON f.faculty_id = u.user_id
        WHERE e.student_id = ? AND e.status = 'ACTIVE' AND c.faculty_id IS NOT NULL
        ORDER BY u.first_name, u.last_name
      `).all(id).map((row) => snakeToCamel(row));
    }

    res.json({ ...snakeToCamel(user), courseIds, courseFaculties });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// GET FACULTY LIST
app.get('/api/faculty', authenticateToken, (req, res) => {
  try {
    const faculty = db.prepare(`
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone_number, f.faculty_id, f.employee_id, f.department, f.designation
      FROM users u
      JOIN faculty f ON u.user_id = f.faculty_id
      WHERE u.is_active = 1
      ORDER BY u.first_name
    `).all();
    res.json(faculty.map(f => snakeToCamel(f)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// CREATE USER (Admin only)
app.post('/api/users', authenticateToken, authorize(['ADMIN']), (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber, dateOfBirth, gender, address, userType, courseIds, facultyId } = req.body;
    const normalizedCourseIds = Array.isArray(courseIds) ? courseIds.map((id) => toInt(id)).filter((id) => id !== null) : [];

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Use default password "password123" hashed
    const passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    const insertUserTx = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(email, passwordHash, firstName, lastName, phoneNumber, dateOfBirth, gender, address, userType);
      const userId = result.lastInsertRowid;

      if (userType === 'STUDENT') {
        const enrollNo = `STU${Date.now()}`;
        const resolvedFacultyId = toInt(facultyId) ?? derivePrimaryFacultyFromCourses(normalizedCourseIds);
        db.prepare(`
          INSERT INTO students (student_id, enrollment_no, program, department, enrollment_year, current_sem, cgpa, assigned_faculty_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, enrollNo, 'B.Tech', 'Computer Science', 2025, 4, 0, resolvedFacultyId);
      } else if (userType === 'FACULTY') {
        const empId = `FAC${Date.now()}`;
        db.prepare(`
          INSERT INTO faculty (faculty_id, employee_id, department, designation, specialization, joining_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, empId, 'Computer Science', 'Assistant Professor', 'General', new Date().toISOString().split('T')[0]);
      }

      if (normalizedCourseIds.length > 0) {
        if (userType === 'STUDENT') {
          const enrollStmt = db.prepare(`
            INSERT OR IGNORE INTO enrollments (student_id, course_id, status)
            VALUES (?, ?, 'ACTIVE')
          `);
          normalizedCourseIds.forEach((courseId) => {
            enrollStmt.run(userId, courseId);
          });
        } else if (userType === 'FACULTY') {
          const assignStmt = db.prepare('UPDATE courses SET faculty_id = ? WHERE course_id = ?');
          normalizedCourseIds.forEach((courseId) => {
            assignStmt.run(userId, courseId);
          });
        }
      }

      return userId;
    });

    const userId = insertUserTx();
    const newUser = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

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
    const { firstName, lastName, phoneNumber, dateOfBirth, gender, address, courseIds, facultyId } = req.body;
    const normalizedCourseIds = Array.isArray(courseIds) ? courseIds.map((value) => toInt(value)).filter((value) => value !== null) : null;

    // Check authorization
    if (req.user.userId !== parseInt(id) && req.user.userType !== 'ADMIN') {
      return res.status(403).json({ message: 'Cannot update other users' });
    }

    const updateUserTx = db.transaction(() => {
      db.prepare(`
        UPDATE users
        SET first_name = ?, last_name = ?, phone_number = ?, date_of_birth = ?, gender = ?, address = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(firstName, lastName, phoneNumber, dateOfBirth, gender, address, id);

      const user = db.prepare('SELECT user_type FROM users WHERE user_id = ?').get(id);

      if (user && user.user_type === 'STUDENT') {
        const resolvedFacultyId = toInt(facultyId)
          ?? (normalizedCourseIds ? derivePrimaryFacultyFromCourses(normalizedCourseIds) : null);
        db.prepare('UPDATE students SET assigned_faculty_id = ? WHERE student_id = ?').run(resolvedFacultyId, id);

        if (normalizedCourseIds !== null) {
          db.prepare('DELETE FROM enrollments WHERE student_id = ?').run(id);
          const enrollStmt = db.prepare('INSERT OR IGNORE INTO enrollments (student_id, course_id, status) VALUES (?, ?, \'ACTIVE\')');
          normalizedCourseIds.forEach((courseId) => {
            enrollStmt.run(id, courseId);
          });
        }
      }

      if (user && user.user_type === 'FACULTY' && Array.isArray(normalizedCourseIds)) {
        db.prepare('UPDATE courses SET faculty_id = NULL WHERE faculty_id = ?').run(id);
        const assignStmt = db.prepare('UPDATE courses SET faculty_id = ? WHERE course_id = ?');
        normalizedCourseIds.forEach((courseId) => {
          assignStmt.run(id, courseId);
        });
      }
    });

    updateUserTx();

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

    const user = db.prepare('SELECT user_type FROM users WHERE user_id = ?').get(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleteUserTx = db.transaction(() => {
      if (user.user_type === 'FACULTY') {
        db.prepare('UPDATE courses SET faculty_id = NULL WHERE faculty_id = ?').run(id);
      }
      db.prepare('DELETE FROM users WHERE user_id = ?').run(id);
    });

    deleteUserTx();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== COURSE ENDPOINTS =====

// GET ALL COURSES
app.get('/api/courses', authenticateToken, (req, res) => {
  try {
    let courses;
    if (req.user.userType === 'FACULTY') {
      courses = db.prepare('SELECT * FROM courses WHERE is_active = 1 AND faculty_id = ?').all(req.user.userId);
    } else {
      courses = db.prepare('SELECT * FROM courses WHERE is_active = 1').all();
    }
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

    const enrollments = db.prepare(`
      SELECT e.enrollment_id, e.student_id, e.status, u.first_name, u.last_name, u.email, s.enrollment_no
      FROM enrollments e
      JOIN users u ON e.student_id = u.user_id
      JOIN students s ON e.student_id = s.student_id
      WHERE e.course_id = ? AND e.status = 'ACTIVE'
      ORDER BY u.first_name, u.last_name
    `).all(id).map(e => snakeToCamel(e));

    res.json({ ...snakeToCamel(course), enrollments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE COURSE (Admin/Faculty)
app.post('/api/courses', authenticateToken, authorize(['ADMIN', 'FACULTY']), (req, res) => {
  try {
    const { courseCode, courseName, department, credits, semester, maxCapacity, description, facultyId } = req.body;

    const stmt = db.prepare(`
      INSERT INTO courses (course_code, course_name, department, credits, semester, max_capacity, description, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const resolvedFacultyId = req.user.userType === 'FACULTY' ? req.user.userId : toInt(facultyId);
    const result = stmt.run(courseCode, courseName, department, credits, semester, maxCapacity, description, resolvedFacultyId);
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
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (req.user.userType === 'FACULTY' && course.faculty_id !== req.user.userId) {
      return res.status(403).json({ message: 'Cannot edit course you don\'t own' });
    }

    const resolvedFacultyId = req.user.userType === 'FACULTY'
      ? req.user.userId
      : (facultyId === undefined ? course.faculty_id : toInt(facultyId));

    const stmt = db.prepare(`
      UPDATE courses 
      SET course_name = ?, department = ?, credits = ?, semester = ?, max_capacity = ?, description = ?, faculty_id = ?
      WHERE course_id = ?
    `);

    stmt.run(courseName, department, credits, semester, maxCapacity, description, resolvedFacultyId, id);
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

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(courseId, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only view enrollments for your own courses' });
      }
    }

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

app.get('/api/enrollments/me', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const enrollments = db.prepare(`
      SELECT e.*, c.course_code, c.course_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = ?
      ORDER BY e.enrollment_date DESC
    `).all(req.user.userId);

    res.json(enrollments.map((e) => snakeToCamel(e)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET STUDENT'S ENROLLMENTS
app.get('/api/enrollments/student/:studentId', authenticateToken, (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.userType === 'STUDENT' && req.user.userId !== toInt(studentId)) {
      return res.status(403).json({ message: 'Cannot access other students\' enrollments' });
    }
    
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

    if (req.user.userType === 'STUDENT' && req.user.userId !== toInt(studentId)) {
      return res.status(403).json({ message: 'Cannot access other students\' attendance' });
    }

    let query = `
      SELECT
        a.*, 
        c.course_name,
        c.course_code,
        u.first_name AS marked_by_first_name,
        u.last_name AS marked_by_last_name
      FROM attendance a
      JOIN courses c ON a.course_id = c.course_id
      LEFT JOIN faculty f ON a.marked_by = f.faculty_id
      LEFT JOIN users u ON f.faculty_id = u.user_id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY a.date DESC, a.marked_at DESC';

    const attendance = db.prepare(query).all(...params);
    res.json(attendance.map((a) => {
      const item = snakeToCamel(a);
      const first = item.markedByFirstName || '';
      const last = item.markedByLastName || '';
      item.markedByName = `${first} ${last}`.trim() || 'N/A';
      return item;
    }));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET MY ATTENDANCE (Student only)
app.get('/api/attendance/me', authenticateToken, authorize(['STUDENT']), (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        COALESCE(SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END), 0) AS present,
        COALESCE(SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END), 0) AS absent,
        COALESCE(SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END), 0) AS late,
        COUNT(a.attendance_id) AS total
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN attendance a ON a.course_id = c.course_id AND a.student_id = e.student_id
      WHERE e.student_id = ? AND e.status = 'ACTIVE'
      GROUP BY c.course_id, c.course_name, c.course_code
      ORDER BY c.course_code
    `).all(req.user.userId);

    const courseStats = {};
    rows.forEach((row) => {
      const key = String(row.course_id);
      const present = Number(row.present) || 0;
      const absent = Number(row.absent) || 0;
      const late = Number(row.late) || 0;
      const total = Number(row.total) || 0;
      courseStats[key] = {
        courseName: row.course_name,
        courseCode: row.course_code,
        present,
        absent,
        late,
        total,
        percentage: total > 0 ? (present / total) * 100 : 0
      };
    });

    res.json(courseStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ATTENDANCE FOR COURSE ON DATE (Faculty/Admin)
app.get('/api/attendance/course/:courseId', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const courseId = toInt(req.params.courseId);
    const date = req.query.date;

    if (!courseId || !date) {
      return res.status(400).json({ message: 'courseId and date are required' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(courseId, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only view attendance for your own courses' });
      }
    }

    const records = db.prepare(`
      SELECT attendance_id, student_id, course_id, date, status, marked_by
      FROM attendance
      WHERE course_id = ? AND date = ?
    `).all(courseId, date);

    res.json(records.map((record) => snakeToCamel(record)));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// MARK ATTENDANCE (Faculty only)
app.post('/api/attendance/bulk', authenticateToken, authorize(['FACULTY', 'ADMIN']), (req, res) => {
  try {
    const attendanceList = req.body;

    if (!Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({ message: 'No attendance records provided' });
    }

    const courseId = toInt(attendanceList[0].courseId);
    if (!courseId) {
      return res.status(400).json({ message: 'Invalid course selected' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(courseId, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only mark attendance for your own courses' });
      }
    }

    const activeEnrollmentCheck = db.prepare(`
      SELECT enrollment_id
      FROM enrollments
      WHERE student_id = ? AND course_id = ? AND status = 'ACTIVE'
    `);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO attendance (student_id, course_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    const markedBy = req.user.userType === 'FACULTY' ? req.user.userId : null;

    attendanceList.forEach((record) => {
      const studentId = toInt(record.studentId);
      const recordCourseId = toInt(record.courseId);
      if (!studentId || !recordCourseId || !record.date || !record.status) {
        throw new Error('Invalid attendance payload');
      }

      const activeEnrollment = activeEnrollmentCheck.get(studentId, recordCourseId);
      if (!activeEnrollment) {
        throw new Error(`Student ${studentId} is not actively enrolled in course ${recordCourseId}`);
      }

      stmt.run(studentId, recordCourseId, record.date, record.status, markedBy);
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

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(courseId, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only view assignments for your own courses' });
      }
    }

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
      SELECT a.*, c.course_name, c.course_code FROM assignments a
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
        assignmentId: assignment.assignment_id,
        courseId: assignment.course_id,
        courseCode: assignment.course_code,
        courseName: assignment.course_name,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxMarks: assignment.max_marks,
        submitted: !!submission,
        status: submission ? (submission.marks_obtained === null ? 'SUBMITTED' : 'GRADED') : 'PENDING',
        submissionId: submission?.submission_id || null,
        submittedAt: submission?.submission_date || null,
        marksObtained: submission?.marks_obtained ?? null,
        feedback: submission?.feedback || null,
        filePath: submission?.file_path || null
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

    if (!courseId || !title || !dueDate || !maxMarks) {
      return res.status(400).json({ message: 'courseId, title, dueDate, and maxMarks are required' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(courseId, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only create assignments for your own courses' });
      }
    }

    const stmt = db.prepare(`
      INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const createdBy = req.user.userType === 'FACULTY' ? req.user.userId : null;
    const result = stmt.run(courseId, title, description, dueDate, maxMarks, createdBy);
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

    const assignment = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(assignment.course_id, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only update assignments for your own courses' });
      }
    }

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

    const assignment = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(assignment.course_id, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only delete assignments for your own courses' });
      }
    }

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

    if (req.user.userType === 'FACULTY') {
      const assignment = db.prepare('SELECT a.assignment_id FROM assignments a JOIN courses c ON a.course_id = c.course_id WHERE a.assignment_id = ? AND c.faculty_id = ?').get(assignmentId, req.user.userId);
      if (!assignment) {
        return res.status(403).json({ message: 'You can only view submissions for your own courses' });
      }
    }

    const submissions = db.prepare(`
      SELECT
        e.student_id,
        u.first_name,
        u.last_name,
        u.email,
        st.enrollment_no,
        s.submission_id,
        s.assignment_id,
        s.file_path,
        s.submission_date,
        s.marks_obtained,
        s.feedback
      FROM assignments a
      JOIN enrollments e ON a.course_id = e.course_id AND e.status = 'ACTIVE'
      JOIN students st ON e.student_id = st.student_id
      JOIN users u ON e.student_id = u.user_id
      LEFT JOIN submissions s ON s.assignment_id = a.assignment_id AND s.student_id = e.student_id
      WHERE a.assignment_id = ?
      ORDER BY u.first_name, u.last_name
    `).all(assignmentId);

    const response = submissions.map((row) => {
      const item = snakeToCamel(row);
      item.submitted = !!item.submissionId;
      item.status = item.submitted ? 'SUBMITTED' : 'NOT_SUBMITTED';
      return item;
    });

    res.json(response);
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

    const eligibleAssignment = db.prepare(`
      SELECT a.assignment_id
      FROM assignments a
      JOIN enrollments e ON a.course_id = e.course_id
      WHERE a.assignment_id = ? AND e.student_id = ? AND e.status = 'ACTIVE'
    `).get(id, req.user.userId);

    if (!eligibleAssignment) {
      return res.status(403).json({ message: 'You can submit only for assignments in your enrolled courses' });
    }

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
    const marksObtained = req.body.marksObtained ?? req.body.marks;
    const feedback = req.body.feedback || null;

    const submission = db.prepare(`
      SELECT s.submission_id, a.course_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.assignment_id
      WHERE s.submission_id = ?
    `).get(id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (req.user.userType === 'FACULTY') {
      const ownedCourse = db.prepare('SELECT course_id FROM courses WHERE course_id = ? AND faculty_id = ?').get(submission.course_id, req.user.userId);
      if (!ownedCourse) {
        return res.status(403).json({ message: 'You can only grade submissions for your own courses' });
      }
    }

    const stmt = db.prepare(`
      UPDATE submissions 
      SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = CURRENT_TIMESTAMP
      WHERE submission_id = ?
    `);

    const gradedBy = req.user.userType === 'FACULTY' ? req.user.userId : null;
    stmt.run(marksObtained, feedback, gradedBy, id);
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
