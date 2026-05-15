package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * ExchangeMessage entity for communication between exchange participants.
 * Supports rich text messaging and file attachments.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "exchange_messages", indexes = {
    @Index(name = "idx_exchange_message_exchange", columnList = "exchange_id"),
    @Index(name = "idx_exchange_message_sender", columnList = "sender_id"),
    @Index(name = "idx_exchange_message_created", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ExchangeMessage extends BaseEntity {

    @NotNull(message = "Exchange is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_message_exchange"))
    private Exchange exchange;

    @NotNull(message = "Sender is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_message_sender"))
    private User sender;

    @NotBlank(message = "Message content is required")
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "attachment_type", length = 50)
    private String attachmentType;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private java.time.LocalDateTime readAt;

    /**
     * Enum for message types
     */
    public enum MessageType {
        TEXT, IMAGE, DOCUMENT, LOCATION, SYSTEM
    }
}
