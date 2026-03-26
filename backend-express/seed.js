const db = require('./db');
const bcrypt = require('bcryptjs');

const seedDatabase = () => {
  try {
    // Clear existing data (for testing)
    const clearData = false; // Set to true if you want to clear and reseed
    if (clearData) {
      db.exec('DELETE FROM submissions');
      db.exec('DELETE FROM assignments');
      db.exec('DELETE FROM attendance');
      db.exec('DELETE FROM enrollments');
      db.exec('DELETE FROM courses');
      db.exec('DELETE FROM students');
      db.exec('DELETE FROM faculty');
      db.exec('DELETE FROM users');
    }

    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count > 0) {
      console.log('✅ Database already seeded. Skipping...');
      return;
    }

    console.log('🌱 Seeding database...');

    // Insert users
    const saltRounds = 10;
    const passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; // password123

    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      ['admin@scms.edu', passwordHash, 'Admin', 'User', '9876543210', '1980-01-01', 'Male', 'Admin Office, CET', 'ADMIN'],
      ['faculty1@scms.edu', passwordHash, 'Rajesh', 'Kumar', '9876543211', '1985-05-15', 'Male', 'Faculty Quarters, CET', 'FACULTY'],
      ['student1@scms.edu', passwordHash, 'Abhijith', 'Unni', '9876543212', '2004-08-20', 'Male', 'Hostel Block A, CET', 'STUDENT'],
      ['student2@scms.edu', passwordHash, 'Priya', 'Nair', '9876543213', '2004-11-10', 'Female', 'Hostel Block B, CET', 'STUDENT']
    ];

    users.forEach(user => insertUser.run(...user));
    console.log('✅ Users inserted');

    // Insert faculty
    db.prepare(`
      INSERT INTO faculty (faculty_id, employee_id, department, designation, specialization, joining_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(2, 'FAC001', 'Computer Science', 'Assistant Professor', 'Data Structures & Algorithms', '2015-07-01');
    console.log('✅ Faculty inserted');

    // Insert students
    db.prepare(`
      INSERT INTO students (student_id, enrollment_no, program, department, enrollment_year, current_sem, cgpa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(3, 'CS2025002', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 8.5);

    db.prepare(`
      INSERT INTO students (student_id, enrollment_no, program, department, enrollment_year, current_sem, cgpa)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(4, 'CS2025074', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 9.2);
    console.log('✅ Students inserted');

    // Insert courses
    const insertCourse = db.prepare(`
      INSERT INTO courses (course_code, course_name, department, credits, semester, max_capacity, description, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const courses = [
      ['CS401', 'Data Structures', 'Computer Science', 4, 4, 60, 'Introduction to fundamental data structures and algorithms', 2],
      ['CS402', 'Database Management Systems', 'Computer Science', 4, 4, 60, 'Relational database design and SQL programming', 2],
      ['CS403', 'Operating Systems', 'Computer Science', 4, 4, 60, 'Process management, memory management, and file systems', 2]
    ];

    courses.forEach(course => insertCourse.run(...course));
    console.log('✅ Courses inserted');

    // Insert enrollments
    const insertEnrollment = db.prepare(`
      INSERT INTO enrollments (student_id, course_id, status)
      VALUES (?, ?, ?)
    `);

    const enrollments = [
      [3, 1, 'ACTIVE'],
      [3, 2, 'ACTIVE'],
      [3, 3, 'ACTIVE'],
      [4, 1, 'ACTIVE'],
      [4, 2, 'ACTIVE'],
      [4, 3, 'ACTIVE']
    ];

    enrollments.forEach(enroll => insertEnrollment.run(...enroll));
    console.log('✅ Enrollments inserted');

    // Insert attendance
    const insertAttendance = db.prepare(`
      INSERT INTO attendance (student_id, course_id, date, status, marked_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    const attendanceData = [
      // Course 1 - 70%
      [3, 1, '2026-02-01', 'PRESENT', 2],
      [3, 1, '2026-02-03', 'PRESENT', 2],
      [3, 1, '2026-02-05', 'ABSENT', 2],
      [3, 1, '2026-02-08', 'PRESENT', 2],
      [3, 1, '2026-02-10', 'PRESENT', 2],
      [3, 1, '2026-02-12', 'ABSENT', 2],
      [3, 1, '2026-02-15', 'PRESENT', 2],
      [3, 1, '2026-02-17', 'PRESENT', 2],
      [3, 1, '2026-02-19', 'PRESENT', 2],
      [3, 1, '2026-02-22', 'ABSENT', 2],
      // Course 2 - 85%
      [3, 2, '2026-02-02', 'PRESENT', 2],
      [3, 2, '2026-02-04', 'PRESENT', 2],
      [3, 2, '2026-02-06', 'PRESENT', 2],
      [3, 2, '2026-02-09', 'ABSENT', 2],
      [3, 2, '2026-02-11', 'PRESENT', 2]
    ];

    attendanceData.forEach(record => insertAttendance.run(...record));
    console.log('✅ Attendance records inserted');

    // Insert assignments
    const insertAssignment = db.prepare(`
      INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const assignments = [
      [1, 'Implement Binary Search Tree', 'Create a BST implementation in Java with insert, delete, and search operations', '2026-03-15 23:59:59', 20, 2],
      [1, 'Sorting Algorithm Analysis', 'Compare the performance of QuickSort, MergeSort, and HeapSort', '2026-03-22 23:59:59', 15, 2],
      [2, 'Design ER Diagram', 'Create an ER diagram for a library management system', '2026-03-18 23:59:59', 25, 2],
      [2, 'SQL Query Assignment', 'Write complex SQL queries for the given database schema', '2026-03-25 23:59:59', 20, 2],
      [3, 'Process Scheduling Simulation', 'Implement FCFS, SJF, and Round Robin scheduling algorithms', '2026-03-20 23:59:59', 30, 2]
    ];

    assignments.forEach(assignment => insertAssignment.run(...assignment));
    console.log('✅ Assignments inserted');

    // Insert submissions
    db.prepare(`
      INSERT INTO submissions (assignment_id, student_id, file_path, marks_obtained, feedback, graded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(1, 4, '/uploads/assignments/sample_submission.pdf', 18, 'Excellent implementation. Good handling of edge cases.', 2);
    console.log('✅ Submissions inserted');

    // Insert course_faculty mappings
    db.prepare('INSERT OR IGNORE INTO course_faculty (course_id, faculty_id) VALUES (?, ?)').run(1, 2);
    db.prepare('INSERT OR IGNORE INTO course_faculty (course_id, faculty_id) VALUES (?, ?)').run(2, 2);
    db.prepare('INSERT OR IGNORE INTO course_faculty (course_id, faculty_id) VALUES (?, ?)').run(3, 2);
    console.log('✅ Course-faculty mappings inserted');

    // Update students with mentor faculty
    db.prepare('UPDATE students SET mentor_faculty_id = ? WHERE student_id = ?').run(2, 3);
    db.prepare('UPDATE students SET mentor_faculty_id = ? WHERE student_id = ?').run(2, 4);
    console.log('✅ Student mentors updated');

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  }
};

seedDatabase();
