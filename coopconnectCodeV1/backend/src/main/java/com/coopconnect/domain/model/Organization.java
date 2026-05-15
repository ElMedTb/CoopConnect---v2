package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Organization entity — cooperatives, PME, TPE, or any entity
 * that can register on the platform to exchange surplus resources.
 */
@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_admin", columnList = "admin_id"),
    @Index(name = "idx_org_type", columnList = "org_type"),
    @Index(name = "idx_org_status", columnList = "status"),
    @Index(name = "idx_org_location", columnList = "latitude,longitude"),
    @Index(name = "idx_org_sector", columnList = "sector")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Organization extends BaseEntity {

    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 200)
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "org_type", nullable = false)
    private OrgType orgType;

    @Enumerated(EnumType.STRING)
    @Column(name = "sector", nullable = false)
    private Sector sector;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrgStatus status = OrgStatus.ACTIVE;

    @Column(name = "siret", length = 20)
    private String siret;

    @Column(name = "website", length = 300)
    private String website;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 150)
    private String contactEmail;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "member_count")
    private Integer memberCount;

    @Column(name = "year_founded")
    private Integer yearFounded;

    @Column(name = "values_labels", length = 500)
    private String valuesLabels; // "bio, local, commerce équitable, zéro déchet"

    @Column(name = "rating_average")
    private Double ratingAverage = 0.0;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "trust_score")
    private Double trustScore = 0.0;

    @Column(name = "partnerships_count")
    private Integer partnershipsCount = 0;

    @Column(name = "co2_saved_kg")
    private Double co2SavedKg = 0.0;

    @Column(name = "waste_recycled_pct")
    private Double wasteRecycledPct = 0.0;

    // --- Relationships ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false, foreignKey = @ForeignKey(name = "fk_org_admin"))
    private User admin;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Resource> resources;

    // --- Enums ---

    public enum OrgType {
        COOPERATIVE, PME, TPE, GRANDE_ENTREPRISE, ASSOCIATION, COLLECTIVITE, ARTISAN, AUTO_ENTREPRENEUR
    }

    public enum Sector {
        AGRICULTURE, AGROALIMENTAIRE, ARTISANAT, RESTAURATION, LOGISTIQUE,
        ENERGIE, EDUCATION, SERVICES, DISTRIBUTION, BTP,
        TEXTILE, TECHNOLOGIE, SANTE, TOURISME, AUTRE
    }

    public enum OrgStatus {
        PENDING_VERIFICATION, ACTIVE, SUSPENDED, DEACTIVATED
    }
}
