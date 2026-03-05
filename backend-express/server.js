const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8081;
const JWT_SECRET = 'scms_super_secret_jwt_key_2025_college';

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

// In-memory database
let database = {
  users: [
    {
      userId: 1,
      email: 'admin@scms.edu',
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '9876543210',
      dateOfBirth: '1980-01-01',
      gender: 'Male',
      address: 'Admin Office, CET',
      userType: 'ADMIN',
      isActive: true
    },
    {
      userId: 2,
      email: 'faculty1@scms.edu',
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phoneNumber: '9876543211',
      dateOfBirth: '1985-05-15',
      gender: 'Male',
      address: 'Faculty Quarters, CET',
      userType: 'FACULTY',
      isActive: true
    },
    {
      userId: 3,
      email: 'student1@scms.edu',
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      firstName: 'Abhijith',
      lastName: 'Unni',
      phoneNumber: '9876543212',
      dateOfBirth: '2004-08-20',
      gender: 'Male',
      address: 'Hostel Block A, CET',
      userType: 'STUDENT',
      isActive: true,
      enrollmentNo: 'CS2025002',
      program: 'B.Tech Computer Science',
      department: 'Computer Science',
      enrollmentYear: 2025,
      currentSem: 4,
      cgpa: 8.5
    },
    {
      userId: 4,
      email: 'student2@scms.edu',
      passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      firstName: 'Priya',
      lastName: 'Nair',
      phoneNumber: '9876543213',
      dateOfBirth: '2004-11-10',
      gender: 'Female',
      address: 'Hostel Block B, CET',
      userType: 'STUDENT',
      isActive: true,
      enrollmentNo: 'CS2025074',
      program: 'B.Tech Computer Science',
      department: 'Computer Science',
      enrollmentYear: 2025,
      currentSem: 4,
      cgpa: 9.2
    }
  ],
  courses: [
    {
      courseId: 1,
      courseCode: 'CS401',
      courseName: 'Data Structures',
      department: 'Computer Science',
      credits: 4,
      semester: 4,
      maxCapacity: 60,
      description: 'Introduction to fundamental data structures and algorithms',
      isActive: true
    },
    {
      courseId: 2,
      courseCode: 'CS402',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      credits: 4,
      semester: 4,
      maxCapacity: 60,
      description: 'Relational database design and SQL programming',
      isActive: true
    },
    {
      courseId: 3,
      courseCode: 'CS403',
      courseName: 'Operating Systems',
      department: 'Computer Science',
      credits: 4,
      semester: 4,
      maxCapacity: 60,
      description: 'Process management, memory management, and file systems',
      isActive: true
    }
  ],
  enrollments: [
    { enrollmentId: 1, studentId: 3, courseId: 1, status: 'ACTIVE' },
    { enrollmentId: 2, studentId: 3, courseId: 2, status: 'ACTIVE' },
    { enrollmentId: 3, studentId: 3, courseId: 3, status: 'ACTIVE' },
    { enrollmentId: 4, studentId: 4, courseId: 1, status: 'ACTIVE' },
    { enrollmentId: 5, studentId: 4, courseId: 2, status: 'ACTIVE' },
    { enrollmentId: 6, studentId: 4, courseId: 3, status: 'ACTIVE' }
  ],
  attendance: [
    { attendanceId: 1, studentId: 3, courseId: 1, date: '2026-02-01', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-01T09:00:00' },
    { attendanceId: 2, studentId: 3, courseId: 1, date: '2026-02-03', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-03T09:00:00' },
    { attendanceId: 3, studentId: 3, courseId: 1, date: '2026-02-05', status: 'ABSENT', markedBy: 2, markedAt: '2026-02-05T09:00:00' },
    { attendanceId: 4, studentId: 3, courseId: 1, date: '2026-02-08', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-08T09:00:00' },
    { attendanceId: 5, studentId: 3, courseId: 1, date: '2026-02-10', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-10T09:00:00' },
    { attendanceId: 6, studentId: 3, courseId: 1, date: '2026-02-12', status: 'ABSENT', markedBy: 2, markedAt: '2026-02-12T09:00:00' },
    { attendanceId: 7, studentId: 3, courseId: 1, date: '2026-02-15', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-15T09:00:00' },
    { attendanceId: 8, studentId: 3, courseId: 1, date: '2026-02-17', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-17T09:00:00' },
    { attendanceId: 9, studentId: 3, courseId: 1, date: '2026-02-19', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-19T09:00:00' },
    { attendanceId: 10, studentId: 3, courseId: 1, date: '2026-02-22', status: 'ABSENT', markedBy: 2, markedAt: '2026-02-22T09:00:00' },
    { attendanceId: 11, studentId: 3, courseId: 2, date: '2026-02-02', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-02T10:00:00' },
    { attendanceId: 12, studentId: 3, courseId: 2, date: '2026-02-04', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-04T10:00:00' },
    { attendanceId: 13, studentId: 3, courseId: 2, date: '2026-02-06', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-06T10:00:00' },
    { attendanceId: 14, studentId: 3, courseId: 2, date: '2026-02-09', status: 'ABSENT', markedBy: 2, markedAt: '2026-02-09T10:00:00' },
    { attendanceId: 15, studentId: 3, courseId: 2, date: '2026-02-11', status: 'PRESENT', markedBy: 2, markedAt: '2026-02-11T10:00:00' }
  ],
  assignments: [
    {
      assignmentId: 1,
      courseId: 1,
      title: 'Implement Binary Search Tree',
      description: 'Create a BST implementation in Java with insert, delete, and search operations',
      dueDate: '2026-03-15T23:59:59',
      maxMarks: 20,
      createdBy: 2,
      createdAt: '2026-02-20T10:00:00'
    },
    {
      assignmentId: 2,
      courseId: 1,
      title: 'Sorting Algorithm Analysis',
      description: 'Compare the performance of QuickSort, MergeSort, and HeapSort',
      dueDate: '2026-03-22T23:59:59',
      maxMarks: 15,
      createdBy: 2,
      createdAt: '2026-02-20T10:00:00'
    },
    {
      assignmentId: 3,
      courseId: 2,
      title: 'Design ER Diagram',
      description: 'Create an ER diagram for a library management system',
      dueDate: '2026-03-18T23:59:59',
      maxMarks: 25,
      createdBy: 2,
      createdAt: '2026-02-21T10:00:00'
    },
    {
      assignmentId: 4,
      courseId: 2,
      title: 'SQL Query Assignment',
      description: 'Write complex SQL queries for the given database schema',
      dueDate: '2026-03-25T23:59:59',
      maxMarks: 20,
      createdBy: 2,
      createdAt: '2026-02-21T10:00:00'
    },
    {
      assignmentId: 5,
      courseId: 3,
      title: 'Process Scheduling Simulation',
      description: 'Implement FCFS, SJF, and Round Robin scheduling algorithms',
      dueDate: '2026-03-20T23:59:59',
      maxMarks: 30,
      createdBy: 2,
      createdAt: '2026-02-22T10:00:00'
    }
  ],
  submissions: [
    {
      submissionId: 1,
      assignmentId: 1,
      studentId: 4,
      filePath: '/uploads/assignments/sample_submission.pdf',
      submissionDate: '2026-03-10T15:30:00',
      marksObtained: 18,
      feedback: 'Excellent implementation. Good handling of edge cases.',
      gradedBy: 2,
      gradedAt: '2026-03-11T10:00:00'
    }
  ]
};

let nextIds = {
  attendance: 16,
  submission: 2
};

// JWT Middleware
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

// AUTH ENDPOINTS
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  const user = database.users.find(u => u.email === email);
  if (!user) {
    console.log('User not found');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // For testing, accept plain password "password123"
  const validPassword = password === 'password123' || await bcrypt.compare(password, user.passwordHash);
  
  if (!validPassword) {
    console.log('Invalid password');
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.userId, email: user.email, userType: user.userType },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { passwordHash, ...userWithoutPassword } = user;
  console.log('Login successful for:', email);
  res.json({ token, user: userWithoutPassword });
});

// COURSE ENDPOINTS
app.get('/api/courses', authenticateToken, (req, res) => {
  res.json(database.courses);
});

app.get('/api/courses/enrolled', authenticateToken, (req, res) => {
  const enrollments = database.enrollments.filter(e => e.studentId === req.user.userId);
  const courses = enrollments.map(e => {
    return database.courses.find(c => c.courseId === e.courseId);
  });
  res.json(courses);
});

// ATTENDANCE ENDPOINTS
app.get('/api/attendance/student/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.query;
  
  let attendance = database.attendance.filter(a => a.studentId === parseInt(studentId));
  
  if (courseId) {
    attendance = attendance.filter(a => a.courseId === parseInt(courseId));
  }
  
  res.json(attendance);
});

app.get('/api/attendance/me', authenticateToken, (req, res) => {
  const attendance = database.attendance.filter(a => a.studentId === req.user.userId);
  
  // Group by course and calculate percentages
  const courseStats = {};
  
  attendance.forEach(record => {
    if (!courseStats[record.courseId]) {
      const course = database.courses.find(c => c.courseId === record.courseId);
      courseStats[record.courseId] = {
        courseName: course.courseName,
        present: 0,
        absent: 0,
        total: 0
      };
    }
    
    courseStats[record.courseId].total++;
    if (record.status === 'PRESENT') {
      courseStats[record.courseId].present++;
    } else {
      courseStats[record.courseId].absent++;
    }
  });
  
  // Calculate percentages
  Object.keys(courseStats).forEach(courseId => {
    const stats = courseStats[courseId];
    stats.percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
  });
  
  res.json(courseStats);
});

app.post('/api/attendance/bulk', authenticateToken, (req, res) => {
  const attendanceList = req.body;
  
  attendanceList.forEach(record => {
    database.attendance.push({
      attendanceId: nextIds.attendance++,
      studentId: record.studentId,
      courseId: record.courseId,
      date: record.date,
      status: record.status,
      markedBy: req.user.userId,
      markedAt: new Date().toISOString()
    });
  });
  
  res.json({ message: 'Attendance marked successfully' });
});

// ASSIGNMENT ENDPOINTS
app.get('/api/assignments/course/:courseId', authenticateToken, (req, res) => {
  const { courseId } = req.params;
  const assignments = database.assignments.filter(a => a.courseId === parseInt(courseId));
  
  const assignmentsWithCourse = assignments.map(assignment => {
    const course = database.courses.find(c => c.courseId === assignment.courseId);
    return { ...assignment, courseName: course.courseName };
  });
  
  res.json(assignmentsWithCourse);
});

app.get('/api/assignments/my', authenticateToken, (req, res) => {
  const enrollments = database.enrollments.filter(e => e.studentId === req.user.userId);
  const courseIds = enrollments.map(e => e.courseId);
  
  const assignments = database.assignments.filter(a => courseIds.includes(a.courseId));
  
  const assignmentsWithDetails = assignments.map(assignment => {
    const course = database.courses.find(c => c.courseId === assignment.courseId);
    const submission = database.submissions.find(s => 
      s.assignmentId === assignment.assignmentId && s.studentId === req.user.userId
    );
    
    return {
      ...assignment,
      courseName: course.courseName,
      submitted: !!submission,
      submittedAt: submission?.submissionDate,
      marksObtained: submission?.marksObtained
    };
  });
  
  res.json(assignmentsWithDetails);
});

app.get('/api/assignments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const assignment = database.assignments.find(a => a.assignmentId === parseInt(id));
  
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
  
  const course = database.courses.find(c => c.courseId === assignment.courseId);
  res.json({ ...assignment, courseName: course.courseName });
});

app.post('/api/assignments/:id/submit', authenticateToken, upload.single('file'), (req, res) => {
  const { id } = req.params;
  const file = req.file;
  
  if (!file) return res.status(400).json({ message: 'No file uploaded' });
  
  database.submissions.push({
    submissionId: nextIds.submission++,
    assignmentId: parseInt(id),
    studentId: req.user.userId,
    filePath: `/uploads/assignments/${file.filename}`,
    submissionDate: new Date().toISOString(),
    marksObtained: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null
  });
  
  res.json({ message: 'Assignment submitted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SCMS Backend running on http://localhost:${PORT}`);
  console.log(`✅ Ready to accept requests`);
  console.log(`\n📝 Test credentials:`);
  console.log(`   Student: student1@scms.edu / password123`);
  console.log(`   Faculty: faculty1@scms.edu / password123`);
});
