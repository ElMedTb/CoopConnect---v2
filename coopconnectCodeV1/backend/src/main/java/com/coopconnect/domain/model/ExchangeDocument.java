package com.coopconnect.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * ExchangeDocument entity for storing documents related to exchanges.
 * Supports various document types for legal and verification purposes.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Entity
@Table(name = "exchange_documents", indexes = {
        @Index(name = "idx_exchange_document_exchange", columnList = "exchange_id"),
        @Index(name = "idx_exchange_document_type", columnList = "document_type"),
        @Index(name = "idx_exchange_document_uploader", columnList = "uploaded_by_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ExchangeDocument extends BaseEntity {

    @NotNull(message = "Exchange is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exchange_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_document_exchange"))
    private Exchange exchange;

    @NotNull(message = "Uploaded by is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false, foreignKey = @ForeignKey(name = "fk_exchange_document_uploader"))
    private User uploadedBy;

    @NotBlank(message = "Document name is required")
    @Size(max = 255, message = "Document name must not exceed 255 characters")
    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @NotBlank(message = "File type is required")
    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "verified_by_id")
    private UUID verifiedById;

    @Column(name = "verified_at")
    private java.time.LocalDateTime verifiedAt;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    /**
     * Enum for document types
     */
    public enum DocumentType {
        AGREEMENT, ID_PROOF, ADDRESS_PROOF, ITEM_PHOTO, DELIVERY_RECEIPT,
        INSURANCE, CERTIFICATION, OTHER
    }
}
