package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exchanges", indexes = {
    @Index(name = "idx_exchange_requester", columnList = "requester_id"),
    @Index(name = "idx_exchange_provider", columnList = "provider_id"),
    @Index(name = "idx_exchange_listing", columnList = "listing_id"),
    @Index(name = "idx_exchange_status", columnList = "status"),
    @Index(name = "idx_exchange_dates", columnList = "created_at,completion_confirmed_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Exchange extends BaseEntity {

    @NotNull(message = "Requester is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_requester"))
    private User requester;

    @NotNull(message = "Provider is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_provider"))
    private User provider;

    @NotNull(message = "Listing is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_listing"))
    private Listing listing;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExchangeStatus status = ExchangeStatus.REQUESTED;

    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "exchange_type", nullable = false)
    private String exchangeType;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "meeting_location", length = 500)
    private String meetingLocation;

    @Column(name = "meeting_coordinates_lat")
    private Double meetingCoordinatesLat;

    @Column(name = "meeting_coordinates_lng")
    private Double meetingCoordinatesLng;

    @Column(name = "is_pickup_required", nullable = false)
    private Boolean isPickupRequired = false;

    @Column(name = "pickup_address", length = 500)
    private String pickupAddress;

    @Column(name = "is_delivery_required", nullable = false)
    private Boolean isDeliveryRequired = false;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_cost")
    private Double deliveryCost;

    @Column(name = "security_deposit")
    private Double securityDeposit;

    @Column(name = "deposit_paid", nullable = false)
    private Boolean depositPaid = false;

    @Column(name = "deposit_refunded", nullable = false)
    private Boolean depositRefunded = false;

    @Column(name = "agreement_terms", columnDefinition = "TEXT")
    private String agreementTerms;

    @Column(name = "agreement_accepted_at")
    private LocalDateTime agreementAcceptedAt;

    @Column(name = "agreement_accepted_by_requester", nullable = false)
    private Boolean agreementAcceptedByRequester = false;

    @Column(name = "agreement_accepted_by_provider", nullable = false)
    private Boolean agreementAcceptedByProvider = false;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Column(name = "completion_photos", columnDefinition = "TEXT")
    private String completionPhotos;

    @Column(name = "completion_confirmed_by_requester", nullable = false)
    private Boolean completionConfirmedByRequester = false;

    @Column(name = "completion_confirmed_by_provider", nullable = false)
    private Boolean completionConfirmedByProvider = false;

    @Column(name = "completion_confirmed_at")
    private LocalDateTime completionConfirmedAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancellation_initiated_by")
    private String cancellationInitiatedBy;

    @Column(name = "cancellation_penalty", nullable = false)
    private Double cancellationPenalty = 0.0;

    @Column(name = "dispute_raised", nullable = false)
    private Boolean disputeRaised = false;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "dispute_resolved", nullable = false)
    private Boolean disputeResolved = false;

    @Column(name = "dispute_resolution", columnDefinition = "TEXT")
    private String disputeResolution;

    @OneToMany(mappedBy = "exchange", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExchangeMessage> messages;

    public enum ExchangeStatus {
        REQUESTED, ACCEPTED, REJECTED, CANCELLED, IN_PROGRESS, COMPLETED, DISPUTED
    }
}
