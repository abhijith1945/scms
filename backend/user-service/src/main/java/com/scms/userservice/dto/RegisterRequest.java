package com.scms.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String userType;
    
    // Student specific
    private String enrollmentNo;
    private String program;
    private String department;
    private Integer enrollmentYear;
    private Integer currentSem;
    
    // Faculty specific
    private String employeeId;
    private String designation;
    private String specialization;
    private LocalDate joiningDate;
}
