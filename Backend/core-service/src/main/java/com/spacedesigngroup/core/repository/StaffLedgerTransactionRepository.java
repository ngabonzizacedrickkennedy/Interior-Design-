package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.StaffLedgerTransaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffLedgerTransactionRepository extends JpaRepository<StaffLedgerTransaction, Long> {

    List<StaffLedgerTransaction> findByStaffIdOrderByCreatedAtDesc(Long staffId);
}
