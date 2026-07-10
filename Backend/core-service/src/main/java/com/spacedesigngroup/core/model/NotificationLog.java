package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @NotNull
    private DispatchChannel dispatchChannel;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String messageBody;

    @Builder.Default
    private Boolean wasRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
