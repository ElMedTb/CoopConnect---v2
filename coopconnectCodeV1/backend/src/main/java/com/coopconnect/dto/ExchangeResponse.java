package com.coopconnect.dto;

import com.coopconnect.domain.model.Exchange;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExchangeResponse {
    private String id;
    private String status;
    private String requestMessage;
    private String responseMessage;

    private String requesterId;
    private String requesterName;
    private String requesterUsername;

    private String providerId;
    private String providerName;
    private String providerUsername;

    private String listingId;
    private String listingTitle;
    private String offeredListingId;
    private String offeredListingTitle;

    private String requesterQrPayload;
    private String providerQrPayload;
    private Boolean requesterQrConfirmed;
    private Boolean providerQrConfirmed;
    private LocalDateTime requesterQrConfirmedAt;
    private LocalDateTime providerQrConfirmedAt;
    private LocalDateTime completionConfirmedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ExchangeResponse fromEntity(Exchange e) {
        String requesterName = e.getRequester().getFirstName() + " " + e.getRequester().getLastName();
        String providerName  = e.getProvider().getFirstName()  + " " + e.getProvider().getLastName();
        return ExchangeResponse.builder()
                .id(e.getId().toString())
                .status(e.getStatus().name())
                .requestMessage(e.getRequestMessage())
                .responseMessage(e.getResponseMessage())
                .requesterId(e.getRequester().getId().toString())
                .requesterName(requesterName)
                .requesterUsername(e.getRequester().getUsername())
                .providerId(e.getProvider().getId().toString())
                .providerName(providerName)
                .providerUsername(e.getProvider().getUsername())
                .listingId(e.getListing().getId().toString())
                .listingTitle(e.getListing().getTitle())
                .offeredListingId(e.getOfferedListing() != null ? e.getOfferedListing().getId().toString() : null)
                .offeredListingTitle(e.getOfferedListing() != null ? e.getOfferedListing().getTitle() : null)
                .requesterQrPayload(buildQrPayload(e, true))
                .providerQrPayload(buildQrPayload(e, false))
                .requesterQrConfirmed(e.getRequesterQrConfirmed())
                .providerQrConfirmed(e.getProviderQrConfirmed())
                .requesterQrConfirmedAt(e.getRequesterQrConfirmedAt())
                .providerQrConfirmedAt(e.getProviderQrConfirmedAt())
                .completionConfirmedAt(e.getCompletionConfirmedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private static String buildQrPayload(Exchange e, boolean requesterSide) {
        String token = requesterSide ? e.getRequesterQrToken() : e.getProviderQrToken();
        if (token == null || e.getId() == null) return null;
        String listingId = requesterSide && e.getOfferedListing() != null
                ? e.getOfferedListing().getId().toString()
                : e.getListing().getId().toString();
        String side = requesterSide ? "REQUESTER" : "PROVIDER";
        return "CCQR:" + e.getId() + ":" + listingId + ":" + side + ":" + token;
    }
}
