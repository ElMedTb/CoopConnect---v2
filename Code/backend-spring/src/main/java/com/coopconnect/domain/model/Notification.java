package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Notification entity for user notifications and alerts.
 * Supports multiple notification types and delivery channels.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user", columnList = "user_id"),
    @Index(name = "idx_notification_type", columnList = "notification_type"),
    @Index(name = "idx_notification_read", columnList = "is_read"),
    @Index(name = "idx_notification_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notification extends BaseEntity {

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_notification_user"))
    private User user;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @NotBlank(message = "Message is required")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private String relatedEntityId;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "is_email_sent", nullable = false)
    private Boolean isEmailSent = false;

    @Column(name = "is_push_sent", nullable = false)
    private Boolean isPushSent = false;

    @Column(name = "is_sms_sent", nullable = false)
    private Boolean isSmsSent = false;

    @Column(name = "scheduled_at")
    private java.time.LocalDateTime scheduledAt;

    @Column(name = "expires_at")
    private java.time.LocalDateTime expiresAt;

    /**
     * Enum for notification types
     */
    public enum NotificationType {
        EXCHANGE_REQUEST, EXCHANGE_ACCEPTED, EXCHANGE_REJECTED, EXCHANGE_COMPLETED,
        MESSAGE_RECEIVED, REVIEW_RECEIVED, LISTING_APPROVED, LISTING_REJECTED,
        PAYMENT_RECEIVED, PAYMENT_FAILED, SYSTEM_ALERT, MARKETING_UPDATE
    }
}
