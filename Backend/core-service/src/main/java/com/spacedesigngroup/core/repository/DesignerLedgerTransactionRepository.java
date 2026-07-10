package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.DesignerLedgerTransaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DesignerLedgerTransactionRepository extends JpaRepository<DesignerLedgerTransaction, Long> {

    List<DesignerLedgerTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
