package com.scms.userservice.service;

import com.scms.userservice.dto.AttendanceRequest;
import com.scms.userservice.model.Attendance;
import com.scms.userservice.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    public List<Attendance> getStudentAttendanceForCourse(Long studentId, Long courseId) {
        return attendanceRepository.findByStudentIdAndCourseId(studentId, courseId);
    }
    
    public List<Attendance> getCourseAttendance(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }
    
    public List<Attendance> getCourseAttendanceForDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseId(courseId).stream()
                .filter(a -> a.getDate().equals(date))
                .toList();
    }
    
    public Attendance markAttendance(AttendanceRequest request, Long markedBy) {
        Attendance attendance = new Attendance();
        attendance.setStudentId(request.getStudentId());
        attendance.setCourseId(request.getCourseId());
        attendance.setDate(request.getDate());
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(request.getStatus().toUpperCase()));
        attendance.setMarkedBy(markedBy);
        
        return attendanceRepository.save(attendance);
    }
    
    public List<Attendance> markBulkAttendance(List<AttendanceRequest> requests, Long markedBy) {
        List<Attendance> attendanceList = requests.stream()
                .map(request -> {
                    Attendance attendance = new Attendance();
                    attendance.setStudentId(request.getStudentId());
                    attendance.setCourseId(request.getCourseId());
                    attendance.setDate(request.getDate());
                    attendance.setStatus(Attendance.AttendanceStatus.valueOf(request.getStatus().toUpperCase()));
                    attendance.setMarkedBy(markedBy);
                    return attendance;
                })
                .toList();
        
        return attendanceRepository.saveAll(attendanceList);
    }
}
