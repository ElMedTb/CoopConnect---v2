package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * UserSkill entity representing skills that users can offer or need.
 * Supports skill level categorization and verification status.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "user_skills", indexes = {
    @Index(name = "idx_user_skill_user", columnList = "user_id"),
    @Index(name = "idx_user_skill_name", columnList = "skill_name"),
    @Index(name = "idx_user_skill_level", columnList = "skill_level")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserSkill extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_skill_user"))
    private User user;

    @NotBlank(message = "Skill name is required")
    @Size(max = 100, message = "Skill name must not exceed 100 characters")
    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(name = "skill_category", length = 50)
    private String skillCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private SkillLevel skillLevel = SkillLevel.BEGINNER;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "is_offered", nullable = false)
    private Boolean isOffered = true;

    @Column(name = "is_needed", nullable = false)
    private Boolean isNeeded = false;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verification_document_url", length = 500)
    private String verificationDocumentUrl;

    @Column(name = "description", length = 1000)
    private String description;

    /**
     * Enum for skill levels
     */
    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, MASTER
    }
}
