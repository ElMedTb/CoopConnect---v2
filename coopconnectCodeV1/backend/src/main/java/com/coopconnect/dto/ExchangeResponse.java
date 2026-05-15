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
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
