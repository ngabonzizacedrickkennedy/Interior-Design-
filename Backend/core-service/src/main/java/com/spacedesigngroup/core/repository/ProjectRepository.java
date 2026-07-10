package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.ProjectAssignmentType;
import com.spacedesigngroup.core.model.ProjectRecord;
import com.spacedesigngroup.core.model.ProjectStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectRecord, Long> {

    List<ProjectRecord> findByClientId(Long clientId);

    List<ProjectRecord> findByCompensatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<ProjectRecord> findByOperationalStatus(ProjectStatus status);

    Optional<ProjectRecord> findByRequestId(Long requestId);

    List<ProjectRecord> findByAssignmentType(ProjectAssignmentType assignmentType);

    List<ProjectRecord> findByAssignedDesignerId(Long userId);

    List<ProjectRecord> findByAssignedStaffId(Long staffId);

    List<ProjectRecord> findByAssignedStaffIdIn(List<Long> staffIds);

    @Query("SELECT COALESCE(SUM(p.request.investedAmount), 0) FROM ProjectRecord p " +
           "WHERE p.assignedDesigner.id = :userId AND p.compensatedAt IS NULL")
    BigDecimal sumPendingAmountForDesigner(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(p.request.investedAmount), 0) FROM ProjectRecord p " +
           "WHERE p.assignedStaff.id = :staffId AND p.compensatedAt IS NULL")
    BigDecimal sumPendingAmountForStaff(@Param("staffId") Long staffId);

    @Query("SELECT COALESCE(SUM(p.request.investedAmount), 0) FROM ProjectRecord p " +
           "WHERE p.assignmentType <> com.spacedesigngroup.core.model.ProjectAssignmentType.UNASSIGNED " +
           "AND p.operationalStatus <> com.spacedesigngroup.core.model.ProjectStatus.COMPLETED")
    BigDecimal sumBlockedInSystem();

    @Query("SELECT p FROM ProjectRecord p WHERE p.assignmentType <> " +
           "com.spacedesigngroup.core.model.ProjectAssignmentType.UNASSIGNED")
    List<ProjectRecord> findAllAssigned();
}
