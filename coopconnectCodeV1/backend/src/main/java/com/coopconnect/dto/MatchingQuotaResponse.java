package com.coopconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingQuotaResponse {
    private String subscriptionPlan;
    private boolean premiumActive;
    private Integer monthlyQuota;
    private Integer usedThisMonth;
    private Integer remainingThisMonth;
    private String usageMonth;
    private String premiumExpiresAt;
}
