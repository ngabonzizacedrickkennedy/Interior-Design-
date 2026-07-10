package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.NotificationLog;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByRecipientId(Long recipientId);

    List<NotificationLog> findByRecipientIdAndWasRead(Long recipientId, Boolean wasRead);
}
