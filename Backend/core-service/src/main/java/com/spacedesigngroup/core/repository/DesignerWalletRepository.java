package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.DesignerWallet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DesignerWalletRepository extends JpaRepository<DesignerWallet, Long> {

    Optional<DesignerWallet> findByUserId(Long userId);
}
