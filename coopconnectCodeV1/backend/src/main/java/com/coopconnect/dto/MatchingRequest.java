package com.coopconnect.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingRequest {

    private ListingDto query;
    private List<ListingDto> candidates;

    @JsonProperty("max_results")
    private int maxResults = 10;

    @JsonProperty("max_distance_km")
    private double maxDistanceKm = 100.0;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingDto {
        private String id;
        private String title;
        private String description;
        private String category;
        private String subcategory;

        @JsonProperty("listing_type")
        private String listingType;

        @JsonProperty("exchange_intent")
        private String exchangeIntent;

        private List<String> tags;
        private Double latitude;
        private Double longitude;

        @JsonProperty("owner_trust_score")
        private Double ownerTrustScore;

        @JsonProperty("estimated_value")
        private Double estimatedValue;
    }
}
