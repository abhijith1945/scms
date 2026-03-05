-- Insert sample users
-- Password for all users: password123 (BCrypt hash)
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active) VALUES
('admin@scms.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', '9876543210', '1980-01-01', 'Male', 'Admin Office, CET', 'ADMIN', true),
('faculty1@scms.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Rajesh', 'Kumar', '9876543211', '1985-05-15', 'Male', 'Faculty Quarters, CET', 'FACULTY', true),
('student1@scms.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Abhijith', 'Unni', '9876543212', '2004-08-20', 'Male', 'Hostel Block A, CET', 'STUDENT', true),
('student2@scms.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya', 'Nair', '9876543213', '2004-11-10', 'Female', 'Hostel Block B, CET', 'STUDENT', true);

-- Insert faculty
INSERT INTO faculty (faculty_id, employee_id, department, designation, specialization, joining_date) VALUES
(2, 'FAC001', 'Computer Science', 'Assistant Professor', 'Data Structures & Algorithms', '2015-07-01');

-- Insert students
INSERT INTO students (student_id, enrollment_no, program, department, enrollment_year, current_sem, cgpa) VALUES
(3, 'CS2025002', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 8.5),
(4, 'CS2025074', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 9.2);

-- Insert courses
INSERT INTO courses (course_code, course_name, department, credits, semester, max_capacity, description, is_active) VALUES
('CS401', 'Data Structures', 'Computer Science', 4, 4, 60, 'Introduction to fundamental data structures and algorithms', true),
('CS402', 'Database Management Systems', 'Computer Science', 4, 4, 60, 'Relational database design and SQL programming', true),
('CS403', 'Operating Systems', 'Computer Science', 4, 4, 60, 'Process management, memory management, and file systems', true);

-- Insert enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES
(3, 1, NOW(), 'ACTIVE'),
(3, 2, NOW(), 'ACTIVE'),
(3, 3, NOW(), 'ACTIVE'),
(4, 1, NOW(), 'ACTIVE'),
(4, 2, NOW(), 'ACTIVE'),
(4, 3, NOW(), 'ACTIVE');

-- Insert attendance records for student 3 (Abhijith)
INSERT INTO attendance (student_id, course_id, date, status, marked_by, marked_at) VALUES
-- Data Structures (Course 1) - 70% attendance
(3, 1, '2026-02-01', 'PRESENT', 2, '2026-02-01 09:00:00'),
(3, 1, '2026-02-03', 'PRESENT', 2, '2026-02-03 09:00:00'),
(3, 1, '2026-02-05', 'ABSENT', 2, '2026-02-05 09:00:00'),
(3, 1, '2026-02-08', 'PRESENT', 2, '2026-02-08 09:00:00'),
(3, 1, '2026-02-10', 'PRESENT', 2, '2026-02-10 09:00:00'),
(3, 1, '2026-02-12', 'ABSENT', 2, '2026-02-12 09:00:00'),
(3, 1, '2026-02-15', 'PRESENT', 2, '2026-02-15 09:00:00'),
(3, 1, '2026-02-17', 'PRESENT', 2, '2026-02-17 09:00:00'),
(3, 1, '2026-02-19', 'PRESENT', 2, '2026-02-19 09:00:00'),
(3, 1, '2026-02-22', 'ABSENT', 2, '2026-02-22 09:00:00'),
-- DBMS (Course 2) - 85% attendance
(3, 2, '2026-02-02', 'PRESENT', 2, '2026-02-02 10:00:00'),
(3, 2, '2026-02-04', 'PRESENT', 2, '2026-02-04 10:00:00'),
(3, 2, '2026-02-06', 'PRESENT', 2, '2026-02-06 10:00:00'),
(3, 2, '2026-02-09', 'ABSENT', 2, '2026-02-09 10:00:00'),
(3, 2, '2026-02-11', 'PRESENT', 2, '2026-02-11 10:00:00'),
(3, 2, '2026-02-13', 'PRESENT', 2, '2026-02-13 10:00:00'),
(3, 2, '2026-02-16', 'PRESENT', 2, '2026-02-16 10:00:00'),
(3, 2, '2026-02-18', 'PRESENT', 2, '2026-02-18 10:00:00'),
(3, 2, '2026-02-20', 'PRESENT', 2, '2026-02-20 10:00:00'),
(3, 2, '2026-02-23', 'ABSENT', 2, '2026-02-23 10:00:00');

-- Insert attendance for student 4 (Priya)
INSERT INTO attendance (student_id, course_id, date, status, marked_by, marked_at) VALUES
-- Data Structures - 90% attendance
(4, 1, '2026-02-01', 'PRESENT', 2, '2026-02-01 09:00:00'),
(4, 1, '2026-02-03', 'PRESENT', 2, '2026-02-03 09:00:00'),
(4, 1, '2026-02-05', 'PRESENT', 2, '2026-02-05 09:00:00'),
(4, 1, '2026-02-08', 'PRESENT', 2, '2026-02-08 09:00:00'),
(4, 1, '2026-02-10', 'PRESENT', 2, '2026-02-10 09:00:00'),
(4, 1, '2026-02-12', 'PRESENT', 2, '2026-02-12 09:00:00'),
(4, 1, '2026-02-15', 'PRESENT', 2, '2026-02-15 09:00:00'),
(4, 1, '2026-02-17', 'PRESENT', 2, '2026-02-17 09:00:00'),
(4, 1, '2026-02-19', 'ABSENT', 2, '2026-02-19 09:00:00'),
(4, 1, '2026-02-22', 'PRESENT', 2, '2026-02-22 09:00:00');

-- Insert assignments
INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by, created_at) VALUES
(1, 'Implement Binary Search Tree', 'Create a BST implementation in Java with insert, delete, and search operations', '2026-03-15 23:59:59', 20, 2, NOW()),
(1, 'Sorting Algorithm Analysis', 'Compare the performance of QuickSort, MergeSort, and HeapSort', '2026-03-22 23:59:59', 15, 2, NOW()),
(2, 'Design ER Diagram', 'Create an ER diagram for a library management system', '2026-03-18 23:59:59', 25, 2, NOW()),
(2, 'SQL Query Assignment', 'Write complex SQL queries for the given database schema', '2026-03-25 23:59:59', 20, 2, NOW()),
(3, 'Process Scheduling Simulation', 'Implement FCFS, SJF, and Round Robin scheduling algorithms', '2026-03-20 23:59:59', 30, 2, NOW());

-- Insert one sample submission
INSERT INTO submissions (assignment_id, student_id, file_path, submission_date, marks_obtained, feedback, graded_by, graded_at) VALUES
(1, 4, '/uploads/assignments/student_4_assignment_1.pdf', '2026-03-10 15:30:00', 18, 'Excellent implementation. Good handling of edge cases.', 2, '2026-03-11 10:00:00');

-- Print success message
SELECT 'Database seeded successfully!' as message;
