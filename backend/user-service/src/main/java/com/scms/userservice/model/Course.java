package com.scms.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;
    
    @Column(name = "course_code", unique = true, nullable = false)
    private String courseCode;
    
    @Column(name = "course_name", nullable = false)
    private String courseName;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false)
    private Integer credits;
    
    @Column(nullable = false)
    private Integer semester;
    
    @Column(name = "max_capacity")
    private Integer maxCapacity = 60;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "faculty_id")
    private Long facultyId;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
