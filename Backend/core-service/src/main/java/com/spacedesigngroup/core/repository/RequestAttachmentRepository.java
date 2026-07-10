package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.RequestAttachment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequestAttachmentRepository extends JpaRepository<RequestAttachment, Long> {

    List<RequestAttachment> findByRequestId(Long requestId);

    Optional<RequestAttachment> findByIdAndRequestId(Long id, Long requestId);

    long countByRequestIdAndCategory(Long requestId, com.spacedesigngroup.core.model.AttachmentCategory category);
}
