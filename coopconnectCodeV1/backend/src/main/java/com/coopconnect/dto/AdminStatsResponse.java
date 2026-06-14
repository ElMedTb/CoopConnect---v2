package com.coopconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long standardUsers;
    private long premiumUsers;
    private double premiumConversionRate;
    private double emailVerificationRate;
    private double phoneVerificationRate;
    private double onboardingCompletionRate;
    private double credibilityVerificationRate;
    private Map<String, Long> usersByType;

    private long totalListings;
    private long activeListings;
    private long exchangedListings;
    private double activeListingsPerActiveUser;
    private Map<String, Long> listingsByStatus;

    private long totalExchanges;
    private long requestedExchanges;
    private long acceptedExchanges;
    private long inProgressExchanges;
    private long completedExchanges;
    private long rejectedExchanges;
    private long cancelledExchanges;
    private long disputedExchanges;
    private double exchangeCompletionRate;
    private double exchangeAcceptanceRate;
    private double exchangeCancellationRate;
    private double qrCompletionRate;
    private Double averageCompletionHours;
    private Map<String, Long> exchangesByStatus;

    private long monthlyMatchingUsage;
    private long standardUsersAtQuota;
    private long standardUsersWithRemainingQuota;
    private long totalRemainingStandardQuota;
}
