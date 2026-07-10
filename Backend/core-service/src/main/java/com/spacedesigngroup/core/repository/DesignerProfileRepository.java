package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.DesignerProfile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DesignerProfileRepository extends JpaRepository<DesignerProfile, Long> {

    Optional<DesignerProfile> findByUserId(Long userId);

    List<DesignerProfile> findByApprovalStatus(com.spacedesigngroup.core.model.DocumentStatus approvalStatus);
}
