package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.DesignDocument;
import com.spacedesigngroup.core.model.DocumentStatus;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignDocumentRepository extends JpaRepository<DesignDocument, Long> {

    List<DesignDocument> findByProjectId(Long projectId);

    List<DesignDocument> findByApprovalBadgeStatus(DocumentStatus status);
}
