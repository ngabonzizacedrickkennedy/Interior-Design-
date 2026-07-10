package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.StaffMessage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StaffMessageRepository extends JpaRepository<StaffMessage, Long> {

    List<StaffMessage> findByStaffIdOrderByCreatedAtAsc(Long staffId);

    List<StaffMessage> findByStaffIdAndCreatedAtAfterOrderByCreatedAtAsc(Long staffId, LocalDateTime since);
}
