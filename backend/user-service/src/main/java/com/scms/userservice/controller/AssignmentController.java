package com.scms.userservice.controller;

import com.scms.userservice.model.Assignment;
import com.scms.userservice.model.Submission;
import com.scms.userservice.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {
    
    @Autowired
    private AssignmentService assignmentService;
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getCourseAssignments(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getCourseAssignments(courseId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }
    
    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }
    
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentSubmissions(assignmentId));
    }
    
    @GetMapping("/{assignmentId}/submissions/student/{studentId}")
    public ResponseEntity<Submission> getStudentSubmission(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId) {
        Submission submission = assignmentService.getStudentSubmission(assignmentId, studentId);
        if (submission == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submission);
    }
    
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam Long studentId,
            @RequestParam("file") MultipartFile file) {
        try {
            Submission submission = assignmentService.submitAssignment(assignmentId, studentId, file);
            return ResponseEntity.ok(submission);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestParam Double marks,
            @RequestParam String feedback,
            @RequestParam Long gradedBy) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, marks, feedback, gradedBy));
    }
}
