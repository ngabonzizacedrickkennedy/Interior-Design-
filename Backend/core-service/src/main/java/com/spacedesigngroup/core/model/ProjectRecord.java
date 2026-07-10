package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private ServiceRequest request;

    @Column(columnDefinition = "TEXT")
    private String milestoneChecklistJson;

    @Builder.Default
    private Integer visualProgressPercent = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProjectStatus operationalStatus = ProjectStatus.PLANNING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProjectAssignmentType assignmentType = ProjectAssignmentType.UNASSIGNED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_designer_id")
    private User assignedDesigner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private Staff assignedStaff;

    private LocalDateTime assignedAt;

    private LocalDateTime compensatedAt;
}
