package com.scms.userservice.service;

import com.scms.userservice.dto.CourseWithAttendanceDTO;
import com.scms.userservice.model.Course;
import com.scms.userservice.model.Enrollment;
import com.scms.userservice.repository.AttendanceRepository;
import com.scms.userservice.repository.CourseRepository;
import com.scms.userservice.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    public List<Course> getAllCourses() {
        return courseRepository.findByIsActive(true);
    }
    
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }
    
    public List<CourseWithAttendanceDTO> getStudentCoursesWithAttendance(Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(
                studentId, Enrollment.EnrollmentStatus.ACTIVE);
        
        List<CourseWithAttendanceDTO> result = new ArrayList<>();
        
        for (Enrollment enrollment : enrollments) {
            Course course = courseRepository.findById(enrollment.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            
            Long presentCount = attendanceRepository.countPresentByStudentIdAndCourseId(
                    studentId, course.getCourseId());
            Long totalClasses = attendanceRepository.countTotalByStudentIdAndCourseId(
                    studentId, course.getCourseId());
            
            Double attendancePercentage = 0.0;
            if (totalClasses > 0) {
                attendancePercentage = (presentCount.doubleValue() / totalClasses.doubleValue()) * 100;
            }
            
            CourseWithAttendanceDTO dto = new CourseWithAttendanceDTO(
                    course.getCourseId(),
                    course.getCourseCode(),
                    course.getCourseName(),
                    course.getDepartment(),
                    course.getCredits(),
                    course.getSemester(),
                    course.getDescription(),
                    Math.round(attendancePercentage * 100.0) / 100.0,
                    presentCount,
                    totalClasses
            );
            
            result.add(dto);
        }
        
        return result;
    }
    
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }
}
