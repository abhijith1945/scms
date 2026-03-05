package com.scms.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Long submissionId;
    
    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "submission_date")
    private LocalDateTime submissionDate = LocalDateTime.now();
    
    @Column(name = "marks_obtained", columnDefinition = "DECIMAL(5,2)")
    private Double marksObtained;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "graded_by")
    private Long gradedBy;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
}
