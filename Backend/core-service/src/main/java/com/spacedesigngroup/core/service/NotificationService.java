package com.spacedesigngroup.core.service;

import com.spacedesigngroup.core.model.NotificationLog;
import com.spacedesigngroup.core.model.DispatchChannel;
import com.spacedesigngroup.core.repository.NotificationRepository;

import com.spacedesigngroup.core.auth.MailService;
import com.spacedesigngroup.core.auth.User;
import com.spacedesigngroup.core.auth.UserRepository;
import com.spacedesigngroup.core.common.exception.ResourceNotFoundException;
import com.spacedesigngroup.core.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    public List<NotificationResponse> findByRecipient(Long userId) {
        return notificationRepository.findByRecipientId(userId).stream().map(this::toResponse).toList();
    }

    public List<NotificationResponse> findUnread(Long userId) {
        return notificationRepository.findByRecipientIdAndWasRead(userId, false)
                .stream().map(this::toResponse).toList();
    }

    public NotificationResponse send(NotificationRequest request) {
        User recipient = userRepository.findById(request.recipientUserId())
                .orElseThrow(() -> ResourceNotFoundException.forEntity("User", request.recipientUserId()));
        NotificationLog log = NotificationLog.builder()
                .recipient(recipient)
                .dispatchChannel(request.dispatchChannel())
                .messageBody(request.messageBody())
                .wasRead(false)
                .build();
        NotificationLog saved = notificationRepository.save(log);

        if (request.dispatchChannel() == DispatchChannel.EMAIL) {
            mailService.sendNotificationEmail(recipient.getEmail(), recipient.getFullName(), request.messageBody());
        }

        return toResponse(saved);
    }

    public NotificationResponse markRead(Long id) {
        NotificationLog log = notificationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.forEntity("NotificationLog", id));
        log.setWasRead(true);
        return toResponse(notificationRepository.save(log));
    }

    public void broadcastToUsers(String message, DispatchChannel channel, List<Long> userIds) {
        userIds.forEach(uid -> send(new NotificationRequest(uid, channel, message)));
    }

    private NotificationResponse toResponse(NotificationLog n) {
        return new NotificationResponse(n.getId(), n.getRecipient().getId(),
                n.getDispatchChannel(), n.getMessageBody(), n.getWasRead(), n.getCreatedAt());
    }
}
