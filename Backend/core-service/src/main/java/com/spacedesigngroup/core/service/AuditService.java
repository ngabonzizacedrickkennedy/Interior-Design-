package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.model.SystemAuditTrail;
import com.spacedesigngroup.core.repository.AuditRepository;

import com.spacedesigngroup.core.dto.AuditTrailResponse;
import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final AuditRepository auditRepository;
    private final UserRepository userRepository;

    public void record(Long operatorId, String action) {
        User operator = operatorId != null
                ? userRepository.findById(operatorId).orElse(null) : null;
        SystemAuditTrail entry = SystemAuditTrail.builder()
                .operator(operator)
                .historicalAction(action)
                .timestampLogged(LocalDateTime.now())
                .build();
        auditRepository.save(entry);
    }

    // Mapping to DTO happens inside the transaction so the lazy-loaded
    // operator field is still accessible within the open Hibernate session.
    public List<AuditTrailResponse> findAll() {
        return auditRepository.findAllByOrderByTimestampLoggedDesc()
                .stream().map(this::toDto).toList();
    }

    public List<AuditTrailResponse> findByOperator(Long operatorId) {
        return auditRepository.findByOperatorIdOrderByTimestampLoggedDesc(operatorId)
                .stream().map(this::toDto).toList();
    }

    private AuditTrailResponse toDto(SystemAuditTrail trail) {
        return new AuditTrailResponse(
                trail.getId(),
                trail.getOperator() != null ? trail.getOperator().getId() : null,
                trail.getOperator() != null ? trail.getOperator().getFullName() : "System",
                trail.getHistoricalAction(),
                trail.getTimestampLogged()
        );
    }
}
