package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * ListingTag entity for categorizing and tagging listings.
 * Supports AI-powered tag suggestions and manual tagging.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "listing_tags", indexes = {
    @Index(name = "idx_listing_tag_listing", columnList = "listing_id"),
    @Index(name = "idx_listing_tag_name", columnList = "tag_name"),
    @Index(name = "idx_listing_tag_type", columnList = "tag_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ListingTag extends BaseEntity {

    @NotNull(message = "Listing is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false, foreignKey = @ForeignKey(name = "fk_listing_tag_listing"))
    private Listing listing;

    @NotBlank(message = "Tag name is required")
    @Size(max = 50, message = "Tag name must not exceed 50 characters")
    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag_type", nullable = false)
    private TagType tagType = TagType.MANUAL;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "is_ai_generated", nullable = false)
    private Boolean isAiGenerated = false;

    /**
     * Enum for tag types
     */
    public enum TagType {
        MANUAL, AI_SUGGESTED, CATEGORY, CONDITION, LOCATION
    }
}
