const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Create/connect to SQLite database
const dbPath = path.join(__dirname, process.env.DATABASE_URL || 'scms.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ SQLite database connected at:', dbPath);

// Initialize database schema
const initDB = () => {
  try {
    // Users Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone_number VARCHAR(15),
        date_of_birth DATE,
        gender VARCHAR(10),
        address TEXT,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('STUDENT', 'FACULTY', 'ADMIN', 'PARENT')),
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Students Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        student_id INTEGER PRIMARY KEY,
        enrollment_no VARCHAR(20) UNIQUE NOT NULL,
        program VARCHAR(100),
        department VARCHAR(100),
        enrollment_year INTEGER,
        current_sem INTEGER,
        cgpa DECIMAL(3,2) DEFAULT 0.00,
        parent_id INTEGER,
        FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    // Faculty Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS faculty (
        faculty_id INTEGER PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE,
        department VARCHAR(100),
        designation VARCHAR(50),
        specialization VARCHAR(100),
        joining_date DATE,
        FOREIGN KEY (faculty_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    // Courses Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        credits INTEGER,
        semester INTEGER,
        max_capacity INTEGER DEFAULT 60,
        description TEXT,
        faculty_id INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
      );
    `);

    // Enrollments Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DROPPED', 'COMPLETED')),
        grade VARCHAR(2),
        marks DECIMAL(5,2),
        UNIQUE(student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
      );
    `);

    // Attendance Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
        marked_by INTEGER,
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id, date),
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES faculty(faculty_id)
      );
    `);

    // Assignments Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignments (
        assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        due_date TIMESTAMP NOT NULL,
        max_marks INTEGER,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES faculty(faculty_id)
      );
    `);

    // Submissions Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        file_path VARCHAR(255),
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        marks_obtained DECIMAL(5,2),
        feedback TEXT,
        graded_by INTEGER,
        graded_at TIMESTAMP,
        UNIQUE(assignment_id, student_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES faculty(faculty_id)
      );
    `);

    // Course-Faculty many-to-many mapping
    db.exec(`
      CREATE TABLE IF NOT EXISTS course_faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        faculty_id INTEGER NOT NULL,
        UNIQUE(course_id, faculty_id),
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Database schema initialized');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
  }
};

// Initialize database on first run
initDB();

// Migration: add mentor_faculty_id to students if not present
try { db.exec('ALTER TABLE students ADD COLUMN mentor_faculty_id INTEGER REFERENCES faculty(faculty_id)'); } catch(e) {
  if (!e.message.includes('duplicate column')) console.error('Migration error:', e.message);
}

module.exports = db;

