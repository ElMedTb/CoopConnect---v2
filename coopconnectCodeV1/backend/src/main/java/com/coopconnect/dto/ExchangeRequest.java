package com.coopconnect.dto;

import lombok.Data;

@Data
public class ExchangeRequest {
    private String listingId;
    private String message;
    private String offeredListingId;
}
