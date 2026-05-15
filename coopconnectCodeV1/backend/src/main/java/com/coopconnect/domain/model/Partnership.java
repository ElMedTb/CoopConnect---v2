package com.coopconnect.domain.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Partnership entity — a collaboration between two organizations.
 * Can be suggested by AI, proposed by a user, or initiated from a resource match.
 */
@Entity
@Table(name = "partnerships", indexes = {
    @Index(name = "idx_part_initiator", columnList = "initiator_id"),
    @Index(name = "idx_part_partner", columnList = "partner_id"),
    @Index(name = "idx_part_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Partnership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiator_id", nullable = false, foreignKey = @ForeignKey(name = "fk_part_initiator"))
    private Organization initiator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false, foreignKey = @ForeignKey(name = "fk_part_partner"))
    private Organization partner;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PartnershipType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PartnershipStatus status = PartnershipStatus.PROPOSED;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "compatibility_score")
    private Double compatibilityScore; // 0-100

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "shared_values", length = 500)
    private String sharedValues; // "bio, local"

    @Column(name = "co2_saved_kg")
    private Double co2SavedKg = 0.0;

    @Column(name = "economic_value_eur")
    private Double economicValueEur = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offered_resource_id", foreignKey = @ForeignKey(name = "fk_part_offered"))
    private Resource offeredResource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_resource_id", foreignKey = @ForeignKey(name = "fk_part_requested"))
    private Resource requestedResource;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // --- Enums ---

    public enum PartnershipType {
        EXCHANGE, PRODUCTION, SERVICES, COMPETENCES, CIRCULAR
    }

    public enum PartnershipStatus {
        SUGGESTED_BY_AI, PROPOSED, ACCEPTED, ACTIVE, COMPLETED, CANCELLED, REJECTED
    }
}
