package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Review entity for user ratings and feedback on exchanges.
 * Supports detailed ratings across multiple dimensions.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_reviewer", columnList = "reviewer_id"),
    @Index(name = "idx_review_reviewed_user", columnList = "reviewed_user_id"),
    @Index(name = "idx_review_exchange", columnList = "exchange_id"),
    @Index(name = "idx_review_rating", columnList = "overall_rating")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Review extends BaseEntity {

    @NotNull(message = "Reviewer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_reviewer"))
    private User reviewer;

    @NotNull(message = "Reviewed user is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_reviewed_user"))
    private User reviewedUser;

    @NotNull(message = "Exchange is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_exchange"))
    private Exchange exchange;

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    @Min(value = 1, message = "Communication rating must be at least 1")
    @Max(value = 5, message = "Communication rating must not exceed 5")
    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Min(value = 1, message = "Reliability rating must be at least 1")
    @Max(value = 5, message = "Reliability rating must not exceed 5")
    @Column(name = "reliability_rating")
    private Integer reliabilityRating;

    @Min(value = 1, message = "Quality rating must be at least 1")
    @Max(value = 5, message = "Quality rating must not exceed 5")
    @Column(name = "quality_rating")
    private Integer qualityRating;

    @Min(value = 1, message = "Value rating must be at least 1")
    @Max(value = 5, message = "Value rating must not exceed 5")
    @Column(name = "value_rating")
    private Integer valueRating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Column(name = "helpful_votes", nullable = false)
    private Integer helpfulVotes = 0;

    @Column(name = "report_count", nullable = false)
    private Integer reportCount = 0;
}
