package com.spacedesigngroup.core.controller;

import com.spacedesigngroup.core.service.ClientService;


import com.spacedesigngroup.core.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public List<ClientResponse> getAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ClientResponse getById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasAnyRole('CLIENT','STAFF','PROJECT_MANAGER','ADMIN')")
    public ClientResponse getByUser(@PathVariable Long userId) {
        return clientService.findByUserId(userId);
    }

    @PostMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClientResponse> create(@PathVariable Long userId,
                                                  @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ClientResponse update(@PathVariable Long id, @Valid @RequestBody ClientRequest request) {
        return clientService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/communication-history")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public List<CommunicationLogResponse> getHistory(@PathVariable Long id) {
        return clientService.getCommunicationHistory(id);
    }

    @PostMapping("/{id}/communication-history")
    @PreAuthorize("hasAnyRole('STAFF','PROJECT_MANAGER','ADMIN')")
    public ResponseEntity<ClientResponse> addLog(@PathVariable Long id,
                                                  @Valid @RequestBody CommunicationLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clientService.addCommunicationLog(id, request));
    }
}
