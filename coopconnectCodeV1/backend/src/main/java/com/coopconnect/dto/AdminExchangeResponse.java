package com.coopconnect.dto;

import com.coopconnect.domain.model.Exchange;
import lombok.Builder;
import lombok.Data;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminExchangeResponse {
    private String id;
    private String status;
    private String requesterName;
    private String requesterUsername;
    private String providerName;
    private String providerUsername;
    private String listingTitle;
    private String offeredListingTitle;
    private Boolean requesterQrConfirmed;
    private Boolean providerQrConfirmed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completionConfirmedAt;
    private Long completionHours;

    public static AdminExchangeResponse fromEntity(Exchange e) {
        LocalDateTime completedAt = e.getCompletionConfirmedAt();
        Long hours = completedAt != null && e.getCreatedAt() != null
                ? Duration.between(e.getCreatedAt(), completedAt).toHours()
                : null;

        return AdminExchangeResponse.builder()
                .id(e.getId().toString())
                .status(e.getStatus().name())
                .requesterName(e.getRequester().getFirstName() + " " + e.getRequester().getLastName())
                .requesterUsername(e.getRequester().getUsername())
                .providerName(e.getProvider().getFirstName() + " " + e.getProvider().getLastName())
                .providerUsername(e.getProvider().getUsername())
                .listingTitle(e.getListing().getTitle())
                .offeredListingTitle(e.getOfferedListing() != null ? e.getOfferedListing().getTitle() : null)
                .requesterQrConfirmed(e.getRequesterQrConfirmed())
                .providerQrConfirmed(e.getProviderQrConfirmed())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .completionConfirmedAt(completedAt)
                .completionHours(hours)
                .build();
    }
}
