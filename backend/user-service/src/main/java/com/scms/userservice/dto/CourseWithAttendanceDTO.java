package com.scms.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseWithAttendanceDTO {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String department;
    private Integer credits;
    private Integer semester;
    private String description;
    private Double attendancePercentage;
    private Long presentCount;
    private Long totalClasses;
}
