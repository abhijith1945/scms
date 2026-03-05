package com.scms.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {
    private Long studentId;
    private Long courseId;
    private LocalDate date;
    private String status; // PRESENT, ABSENT, LATE
}
