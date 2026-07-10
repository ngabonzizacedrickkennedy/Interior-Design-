package com.spacedesigngroup.core.model;

import com.spacedesigngroup.core.auth.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(columnDefinition = "TEXT")
    private String requestDetails;

    @NotNull
    private BigDecimal budgetLimit;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RequestStatus executionStatus = RequestStatus.NEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    private String requestName;

    private String roomType;

    private BigDecimal lengthMeters;
    private BigDecimal widthMeters;
    private BigDecimal ceilingHeightMeters;

    @Column(columnDefinition = "TEXT")
    private String spatialNotes;

    private BigDecimal budgetMin;
    private BigDecimal budgetMax;

    @Builder.Default
    @ElementCollection(targetClass = StylePreference.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "service_request_style_tags", joinColumns = @JoinColumn(name = "service_request_id"))
    @Column(name = "style_tag")
    private List<StylePreference> styleTags = new ArrayList<>();

    private boolean worksFromHome;
    private boolean entertainsOften;
    private boolean hasKids;
    private boolean hasPets;

    @Column(columnDefinition = "TEXT")
    private String storageNeeds;

    @Enumerated(EnumType.STRING)
    private WindowDirection windowDirection;

    @Enumerated(EnumType.STRING)
    private LightLevel naturalLightLevel;

    @Column(columnDefinition = "TEXT")
    private String artificialLightingNotes;

    @Enumerated(EnumType.STRING)
    private ProjectTimeline timeline;

    @Column(columnDefinition = "TEXT")
    private String avoidNotes;

    private String sourcingLocation;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InvestmentStatus investmentStatus = InvestmentStatus.NOT_INVESTED;

    private BigDecimal investedAmount;
    private LocalDateTime investedAt;

    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestAttachment> attachments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiAssessment> assessments = new ArrayList<>();
}
