package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.Wallet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByClientId(Long clientId);
}
