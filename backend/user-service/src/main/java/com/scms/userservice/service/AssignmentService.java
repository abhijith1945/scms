package com.scms.userservice.service;

import com.scms.userservice.model.Assignment;
import com.scms.userservice.model.Submission;
import com.scms.userservice.repository.AssignmentRepository;
import com.scms.userservice.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AssignmentService {
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public List<Assignment> getCourseAssignments(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }
    
    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }
    
    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }
    
    public List<Submission> getAssignmentSubmissions(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }
    
    public Submission getStudentSubmission(Long assignmentId, Long studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(null);
    }
    
    public Submission submitAssignment(Long assignmentId, Long studentId, MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = "assignment_" + assignmentId + "_student_" + studentId + 
                "_" + UUID.randomUUID() + extension;
        
        // Save file
        Path filepath = Paths.get(uploadDir, filename);
        Files.write(filepath, file.getBytes());
        
        // Check if submission already exists
        Submission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElse(new Submission());
        
        submission.setAssignmentId(assignmentId);
        submission.setStudentId(studentId);
        submission.setFilePath(filepath.toString());
        submission.setSubmissionDate(LocalDateTime.now());
        
        return submissionRepository.save(submission);
    }
    
    public Submission gradeSubmission(Long submissionId, Double marks, String feedback, Long gradedBy) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        submission.setMarksObtained(marks);
        submission.setFeedback(feedback);
        submission.setGradedBy(gradedBy);
        submission.setGradedAt(LocalDateTime.now());
        
        return submissionRepository.save(submission);
    }
}
