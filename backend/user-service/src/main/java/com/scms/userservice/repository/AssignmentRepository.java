package com.scms.userservice.repository;

import com.scms.userservice.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByCreatedBy(Long createdBy);
    List<Assignment> findByCourseIdAndDueDateAfter(Long courseId, LocalDateTime date);
}
