-- Smart Campus Management System - Seed Data
-- Insert Admin User
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active) 
VALUES ('admin@scms.edu', '$2a$10$xqYh3L0qKJZ0VjZ0k0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'Admin', 'User', '9876543210', '1985-01-01', 'Male', 'CET Trivandrum', 'ADMIN', 1);

-- Insert Faculty Users
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active) 
VALUES 
('faculty1@scms.edu', '$2a$10$xqYh3L0qKJZ0VjZ0k0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'Dr. Rajesh', 'Kumar', '9876543211', '1980-05-15', 'Male', 'CET Campus', 'FACULTY', 1),
('faculty2@scms.edu', '$2a$10$xqYh3L0qKJZ0VjZ0k0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'Dr. Priya', 'Sharma', '9876543212', '1982-08-20', 'Female', 'CET Campus', 'FACULTY', 1);

-- Insert Student Users
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, date_of_birth, gender, address, user_type, is_active) 
VALUES 
('student1@scms.edu', '$2a$10$xqYh3L0qKJZ0VjZ0k0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'Abhijith', 'S Unni', '9876543213', '2004-03-10', 'Male', 'Trivandrum', 'STUDENT', 1),
('student2@scms.edu', '$2a$10$xqYh3L0qKJZ0VjZ0k0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z', 'Arjun', 'Sathyam', '9876543214', '2004-07-22', 'Male', 'Kochi', 'STUDENT', 1);

-- Insert Faculty Records
INSERT INTO faculty (faculty_id, employee_id, department, designation, specialization, joining_date)
VALUES 
(2, 'FAC001', 'Computer Science', 'Professor', 'Data Structures', '2010-06-01'),
(3, 'FAC002', 'Computer Science', 'Assistant Professor', 'Web Development', '2015-07-15');

-- Insert Student Records
INSERT INTO students (student_id, enrollment_no, program, department, enrollment_year, current_sem, cgpa)
VALUES 
(4, 'CET2025001', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 8.5),
(5, 'CET2025002', 'B.Tech Computer Science', 'Computer Science', 2025, 4, 8.2);

-- Insert Courses
INSERT INTO courses (course_code, course_name, department, credits, semester, max_capacity, description, faculty_id, is_active)
VALUES 
('CS401', 'Data Structures and Algorithms', 'Computer Science', 4, 4, 60, 'Comprehensive study of data structures including arrays, linked lists, trees, graphs, and algorithms', 2, 1),
('CS402', 'Database Management Systems', 'Computer Science', 4, 4, 60, 'Introduction to database concepts, SQL, normalization, and transaction management', 2, 1),
('CS403', 'Web Technologies', 'Computer Science', 3, 4, 60, 'HTML, CSS, JavaScript, React, Node.js and full-stack development', 3, 1);

-- Insert Enrollments
INSERT INTO enrollments (student_id, course_id, status)
VALUES 
(4, 1, 'ACTIVE'),
(4, 2, 'ACTIVE'),
(4, 3, 'ACTIVE'),
(5, 1, 'ACTIVE'),
(5, 2, 'ACTIVE'),
(5, 3, 'ACTIVE');

-- Insert Assignments for all courses
INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by)
VALUES 
(1, 'Binary Tree Implementation', 'Implement a binary search tree with insert, delete, and search operations', datetime('now', '+7 days'), 100, 2),
(1, 'Graph Algorithms', 'Implement Dijkstra and Kruskal algorithms', datetime('now', '+14 days'), 100, 2),
(2, 'SQL Query Assignment', 'Write complex SQL queries for given scenarios', datetime('now', '+5 days'), 50, 2),
(2, 'Database Design Project', 'Design and implement a complete database system', datetime('now', '+21 days'), 150, 2),
(3, 'React Todo App', 'Build a full-featured todo application using React', datetime('now', '+10 days'), 100, 3),
(3, 'REST API Development', 'Create a RESTful API using Node.js and Express', datetime('now', '+15 days'), 100, 3);

-- Insert Sample Submissions
INSERT INTO submissions (assignment_id, student_id, file_path, marks_obtained, feedback, graded_by, graded_at)
VALUES 
(1, 4, 'uploads/assignments/student1_assignment1.pdf', 85.0, 'Good implementation. Consider edge cases.', 2, datetime('now', '-1 day'));

-- Insert Attendance Records for student 1
INSERT INTO attendance (student_id, course_id, date, status, marked_by)
VALUES 
(4, 1, date('now', '-9 days'), 'PRESENT', 2),
(4, 1, date('now', '-8 days'), 'PRESENT', 2),
(4, 1, date('now', '-7 days'), 'ABSENT', 2),
(4, 1, date('now', '-6 days'), 'PRESENT', 2),
(4, 1, date('now', '-5 days'), 'PRESENT', 2),
(4, 1, date('now', '-4 days'), 'LATE', 2),
(4, 1, date('now', '-3 days'), 'PRESENT', 2),
(4, 1, date('now', '-2 days'), 'PRESENT', 2),
(4, 1, date('now', '-1 days'), 'ABSENT', 2),
(4, 1, date('now'), 'PRESENT', 2);

-- Insert Attendance Records for student 2
INSERT INTO attendance (student_id, course_id, date, status, marked_by)
VALUES 
(5, 1, date('now', '-9 days'), 'PRESENT', 2),
(5, 1, date('now', '-8 days'), 'PRESENT', 2),
(5, 1, date('now', '-7 days'), 'PRESENT', 2),
(5, 1, date('now', '-6 days'), 'PRESENT', 2),
(5, 1, date('now', '-5 days'), 'ABSENT', 2),
(5, 1, date('now', '-4 days'), 'PRESENT', 2),
(5, 1, date('now', '-3 days'), 'PRESENT', 2),
(5, 1, date('now', '-2 days'), 'PRESENT', 2),
(5, 1, date('now', '-1 days'), 'PRESENT', 2),
(5, 1, date('now'), 'PRESENT', 2);
