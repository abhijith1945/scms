package com.scms.userservice.service;

import com.scms.userservice.config.JwtUtil;
import com.scms.userservice.dto.LoginRequest;
import com.scms.userservice.dto.LoginResponse;
import com.scms.userservice.dto.RegisterRequest;
import com.scms.userservice.model.Faculty;
import com.scms.userservice.model.Student;
import com.scms.userservice.model.User;
import com.scms.userservice.repository.FacultyRepository;
import com.scms.userservice.repository.StudentRepository;
import com.scms.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("userType", user.getUserType().name());
        
        String token = jwtUtil.generateTokenWithClaims(user.getEmail(), claims);
        
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getUserType().name(),
                user.getUserId()
        );
    }
    
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.setUserType(User.UserType.valueOf(request.getUserType().toUpperCase()));
        
        user = userRepository.save(user);
        
        if (user.getUserType() == User.UserType.STUDENT) {
            Student student = new Student();
            student.setStudentId(user.getUserId());
            student.setUser(user);
            student.setEnrollmentNo(request.getEnrollmentNo());
            student.setProgram(request.getProgram());
            student.setDepartment(request.getDepartment());
            student.setEnrollmentYear(request.getEnrollmentYear());
            student.setCurrentSem(request.getCurrentSem());
            studentRepository.save(student);
        } else if (user.getUserType() == User.UserType.FACULTY) {
            Faculty faculty = new Faculty();
            faculty.setFacultyId(user.getUserId());
            faculty.setUser(user);
            faculty.setEmployeeId(request.getEmployeeId());
            faculty.setDepartment(request.getDepartment());
            faculty.setDesignation(request.getDesignation());
            faculty.setSpecialization(request.getSpecialization());
            faculty.setJoiningDate(request.getJoiningDate());
            facultyRepository.save(faculty);
        }
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getUserType().name(),
                user.getUserId()
        );
    }
}
