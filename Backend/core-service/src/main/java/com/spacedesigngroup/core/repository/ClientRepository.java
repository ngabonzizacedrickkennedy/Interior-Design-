package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.Client;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByUserId(Long userId);
}
