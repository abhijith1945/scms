package com.scms.userservice.repository;

import com.scms.userservice.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByIsActive(Boolean isActive);
    List<Course> findByDepartment(String department);
    List<Course> findBySemester(Integer semester);
}
