package com.scms.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    
    @Id
    @Column(name = "student_id")
    private Long studentId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "student_id")
    private User user;
    
    @Column(name = "enrollment_no", unique = true, nullable = false)
    private String enrollmentNo;
    
    @Column(nullable = false)
    private String program;
    
    @Column(nullable = false)
    private String department;
    
    @Column(name = "enrollment_year", nullable = false)
    private Integer enrollmentYear;
    
    @Column(name = "current_sem", nullable = false)
    private Integer currentSem;
    
    @Column(columnDefinition = "DECIMAL(3,2) DEFAULT 0.00")
    private Double cgpa = 0.0;
    
    @Column(name = "parent_id")
    private Long parentId;
}
