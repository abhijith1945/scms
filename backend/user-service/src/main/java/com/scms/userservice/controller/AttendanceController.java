package com.scms.userservice.controller;

import com.scms.userservice.dto.AttendanceRequest;
import com.scms.userservice.model.Attendance;
import com.scms.userservice.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceForCourse(studentId, courseId));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Attendance>> getCourseAttendance(@PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getCourseAttendance(courseId));
    }
    
    @GetMapping("/course/{courseId}/date/{date}")
    public ResponseEntity<List<Attendance>> getCourseAttendanceByDate(
            @PathVariable Long courseId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getCourseAttendanceForDate(courseId, date));
    }
    
    @PostMapping("/mark")
    public ResponseEntity<Attendance> markAttendance(
            @RequestBody AttendanceRequest request,
            @RequestParam Long markedBy) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, markedBy));
    }
    
    @PostMapping("/mark/bulk")
    public ResponseEntity<List<Attendance>> markBulkAttendance(
            @RequestBody List<AttendanceRequest> requests,
            @RequestParam Long markedBy) {
        return ResponseEntity.ok(attendanceService.markBulkAttendance(requests, markedBy));
    }
}
