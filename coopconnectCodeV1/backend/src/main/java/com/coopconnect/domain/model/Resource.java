package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Resource entity — represents a surplus, a need, or a recurring production
 * that an organization makes available for exchange on the platform.
 */
@Entity
@Table(name = "resources", indexes = {
    @Index(name = "idx_res_org", columnList = "organization_id"),
    @Index(name = "idx_res_type", columnList = "resource_type"),
    @Index(name = "idx_res_category", columnList = "category"),
    @Index(name = "idx_res_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Resource extends BaseEntity {

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 200)
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private ResourceType resourceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ResourceCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "unit", length = 30)
    private String unit; // kg, tonnes, litres, heures, unités, m3

    @Column(name = "estimated_value")
    private Double estimatedValue;

    @Column(name = "currency", length = 5)
    private String currency = "EUR";

    @Column(name = "condition_state", length = 50)
    private String conditionState; // Neuf, Bon état, Correct, À recycler

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "available_until")
    private LocalDateTime availableUntil;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Column(name = "recurring_frequency", length = 50)
    private String recurringFrequency; // "hebdomadaire", "mensuel", "saisonnier"

    @Column(name = "location_text", length = 300)
    private String locationText;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "delivery_available")
    private Boolean deliveryAvailable = false;

    @Column(name = "pickup_only")
    private Boolean pickupOnly = true;

    @Column(name = "max_delivery_km")
    private Integer maxDeliveryKm;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(name = "contact_count")
    private Integer contactCount = 0;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false, foreignKey = @ForeignKey(name = "fk_resource_org"))
    private Organization organization;

    // --- Enums ---

    public enum ResourceType {
        SURPLUS, NEED, PRODUCTION
    }

    public enum ResourceCategory {
        ALIMENTAIRE, MATERIEL, EQUIPEMENT, MATIERE_PREMIERE,
        DECHET_VALORISABLE, ENERGIE, LOGISTIQUE, COMPETENCE,
        ESPACE, VEHICULE, AUTRE
    }

    public enum ResourceStatus {
        AVAILABLE, RESERVED, EXCHANGED, EXPIRED, WITHDRAWN
    }
}
