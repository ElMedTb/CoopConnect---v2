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
import java.util.UUID;

/**
 * Listing entity representing items or services available for exchange.
 * Comprehensive model with categorization, availability, and AI-powered matching.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "listings", indexes = {
    @Index(name = "idx_listing_owner", columnList = "owner_id"),
    @Index(name = "idx_listing_category", columnList = "category"),
    @Index(name = "idx_listing_status", columnList = "status"),
    @Index(name = "idx_listing_location", columnList = "latitude,longitude"),
    @Index(name = "idx_listing_expires", columnList = "expires_at"),
    @Index(name = "idx_listing_featured", columnList = "is_featured")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Listing extends BaseEntity {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ListingCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "subcategory")
    private ListingSubcategory subcategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ListingType type = ListingType.ITEM;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition", nullable = false)
    private ItemCondition condition = ItemCondition.GOOD;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ListingStatus status = ListingStatus.DRAFT;

    @NotNull(message = "Owner is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, foreignKey = @ForeignKey(name = "fk_listing_owner"))
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "exchange_intent")
    private ExchangeIntent exchangeIntent = ExchangeIntent.OFFER;

    @Column(name = "estimated_value")
    private Double estimatedValue;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Column(name = "is_negotiable", nullable = false)
    private Boolean isNegotiable = true;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "featured_until")
    private LocalDateTime featuredUntil;

    @Column(name = "views_count", nullable = false)
    private Integer viewsCount = 0;

    @Column(name = "likes_count", nullable = false)
    private Integer likesCount = 0;

    @Column(name = "inquiries_count", nullable = false)
    private Integer inquiriesCount = 0;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "location_text", length = 500)
    private String locationText;

    @Column(name = "is_pickup_only", nullable = false)
    private Boolean isPickupOnly = false;

    @Column(name = "is_delivery_available", nullable = false)
    private Boolean isDeliveryAvailable = false;

    @Column(name = "delivery_radius_km")
    private Integer deliveryRadiusKm;

    @Column(name = "delivery_cost")
    private Double deliveryCost;

    @Column(name = "availability_start")
    private LocalDateTime availabilityStart;

    @Column(name = "availability_end")
    private LocalDateTime availabilityEnd;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(name = "min_exchange_duration_days")
    private Integer minExchangeDurationDays;

    @Column(name = "max_exchange_duration_days")
    private Integer maxExchangeDurationDays;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "provided_skills", columnDefinition = "TEXT")
    private String providedSkills;

    @Column(name = "ai_category_score")
    private Double aiCategoryScore;

    @Column(name = "ai_quality_score")
    private Double aiQualityScore;

    @Column(name = "ai_matching_tags", columnDefinition = "TEXT")
    private String aiMatchingTags;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Exchange> exchanges;

    /**
     * Enum for listing categories — physical goods only (barter platform)
     */
    public enum ListingCategory {
        ELECTRONICS, CLOTHING, HOME_GARDEN, SPORTS_OUTDOORS, BOOKS_MEDIA,
        TOYS_GAMES, HEALTH_BEAUTY, AUTOMOTIVE, TOOLS, PETS, OTHER
    }

    /**
     * Enum for listing subcategories
     */
    public enum ListingSubcategory {
        // Electronics
        SMARTPHONES, LAPTOPS, TABLETS, GAMING, AUDIO_VIDEO, PHOTOGRAPHY,
        // Clothing
        MENS_CLOTHING, WOMENS_CLOTHING, CHILDRENS_CLOTHING, SHOES, ACCESSORIES,
        // Home & Garden
        FURNITURE, APPLIANCES, DECOR, KITCHEN, GARDEN_TOOLS
    }

    /**
     * Enum for listing types — physical goods only
     */
    public enum ListingType {
        ITEM
    }

    /**
     * Enum for exchange intent — used by the AI matching engine
     */
    public enum ExchangeIntent {
        OFFER, NEED, DONATE
    }

    /**
     * Enum for item conditions
     */
    public enum ItemCondition {
        NEW, LIKE_NEW, EXCELLENT, GOOD, FAIR, POOR
    }

    /**
     * Enum for listing status
     */
    public enum ListingStatus {
        DRAFT, ACTIVE, PENDING_REVIEW, SUSPENDED, EXCHANGED, EXPIRED, DELETED
    }
}
