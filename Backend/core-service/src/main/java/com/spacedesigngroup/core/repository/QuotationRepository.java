package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.Quotation;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    Optional<Quotation> findByRequestId(Long requestId);

    boolean existsByRequestId(Long requestId);
}
