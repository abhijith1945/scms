package com.scms.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "faculty")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Faculty {
    
    @Id
    @Column(name = "faculty_id")
    private Long facultyId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "faculty_id")
    private User user;
    
    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false)
    private String designation;
    
    private String specialization;
    
    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;
}
