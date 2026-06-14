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
public class MatchingResponse {

    @JsonProperty("query_id")
    private String queryId;

    private List<MatchResult> matches;

    @JsonProperty("total_candidates")
    private int totalCandidates;

    private MatchingQuotaResponse quota;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchResult {

        @JsonProperty("listing_id")
        private String listingId;

        private double score;

        @JsonProperty("score_breakdown")
        private ScoreBreakdown scoreBreakdown;

        @JsonProperty("distance_km")
        private Double distanceKm;

        private String explanation;

        // Enrichi par le backend — pas retourné par le service IA
        private String title;
        private String ownerUsername;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreBreakdown {

        @JsonProperty("content_similarity")
        private double contentSimilarity;

        @JsonProperty("category_match")
        private double categoryMatch;

        @JsonProperty("geo_score")
        private double geoScore;

        private double complementarity;

        @JsonProperty("price_proximity")
        private double priceProximity;

        @JsonProperty("trust_weight")
        private double trustWeight;
    }
}
