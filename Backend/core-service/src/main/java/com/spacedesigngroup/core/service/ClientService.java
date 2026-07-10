package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.model.Client;
import com.spacedesigngroup.core.model.CommunicationLog;
import com.spacedesigngroup.core.repository.ClientRepository;

import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.dto.*;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public List<ClientResponse> findAll() {
        return clientRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ClientResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public ClientResponse findByUserId(Long userId) {
        return toResponse(clientRepository.findByUserId(userId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Client", userId)));
    }

    public ClientResponse create(ClientRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", userId));
        Client client = Client.builder()
                .user(user)
                .contactName(request.contactName())
                .contactEmail(request.contactEmail())
                .contactPhone(request.contactPhone())
                .propertyType(request.propertyType())
                .build();
        return toResponse(clientRepository.save(client));
    }

    public ClientResponse update(Long id, ClientRequest request) {
        Client client = getOrThrow(id);
        client.setContactName(request.contactName());
        client.setContactEmail(request.contactEmail());
        client.setContactPhone(request.contactPhone());
        client.setPropertyType(request.propertyType());
        return toResponse(clientRepository.save(client));
    }

    public void delete(Long id) {
        clientRepository.delete(getOrThrow(id));
    }

    public ClientResponse addCommunicationLog(Long clientId, CommunicationLogRequest request) {
        Client client = getOrThrow(clientId);
        CommunicationLog log = CommunicationLog.builder()
                .noteEntry(request.noteEntry())
                .channel(request.channel())
                .recordedAt(LocalDateTime.now())
                .client(client)
                .build();
        client.getCommunicationHistory().add(log);
        return toResponse(clientRepository.save(client));
    }

    public List<CommunicationLogResponse> getCommunicationHistory(Long clientId) {
        Client client = getOrThrow(clientId);
        return client.getCommunicationHistory().stream()
                .map(l -> new CommunicationLogResponse(l.getId(), l.getNoteEntry(), l.getChannel(), l.getRecordedAt()))
                .toList();
    }

    private Client getOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("Client", id));
    }

    private ClientResponse toResponse(Client c) {
        List<CommunicationLogResponse> logs = c.getCommunicationHistory().stream()
                .map(l -> new CommunicationLogResponse(l.getId(), l.getNoteEntry(), l.getChannel(), l.getRecordedAt()))
                .toList();
        return new ClientResponse(
                c.getId(),
                c.getUser() != null ? c.getUser().getId() : null,
                c.getContactName(),
                c.getContactEmail(),
                c.getContactPhone(),
                c.getPropertyType(),
                logs
        );
    }
}
