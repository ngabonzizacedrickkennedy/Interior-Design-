package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.SystemAuditTrail;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditRepository extends JpaRepository<SystemAuditTrail, Long> {

    List<SystemAuditTrail> findByOperatorIdOrderByTimestampLoggedDesc(Long operatorId);

    List<SystemAuditTrail> findAllByOrderByTimestampLoggedDesc();
}
