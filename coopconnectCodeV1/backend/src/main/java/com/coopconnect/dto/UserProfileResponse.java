package com.coopconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.coopconnect.domain.model.User;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean phoneVerified;
    private String bio;
    private String profileImageUrl;
    private String userType;
    private String status;
    private Boolean emailVerified;
    private Boolean onboardingCompleted;
    private Double ratingAverage;
    private Integer ratingCount;
    private Double trustScore;
    private Integer verificationLevel;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private String organizationName;
    private String registrationNumber;
    private String ice;
    private String businessSector;
    private String credibilityNotes;
    private Boolean credibilityVerified;
    private String subscriptionPlan;
    private Boolean premiumActive;
    private LocalDateTime premiumActivatedAt;
    private LocalDateTime premiumExpiresAt;
    private Integer matchingMonthlyQuota;
    private Integer matchingUsedThisMonth;
    private Integer matchingRemainingThisMonth;
    private String matchingUsageMonth;
    private LocalDateTime createdAt;

    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .phoneVerified(user.getPhoneVerified())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .userType(user.getUserType().name())
                .status(user.getStatus().name())
                .emailVerified(user.getEmailVerified())
                .onboardingCompleted(user.getOnboardingCompleted())
                .ratingAverage(user.getRatingAverage())
                .ratingCount(user.getRatingCount())
                .trustScore(user.getTrustScore())
                .verificationLevel(user.getVerificationLevel())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .organizationName(user.getOrganizationName())
                .registrationNumber(user.getRegistrationNumber())
                .ice(user.getIce())
                .businessSector(user.getBusinessSector())
                .credibilityNotes(user.getCredibilityNotes())
                .credibilityVerified(user.getCredibilityVerified())
                .subscriptionPlan(user.getSubscriptionPlan() != null ? user.getSubscriptionPlan().name() : "STANDARD")
                .premiumActive(isPremiumActive(user))
                .premiumActivatedAt(user.getPremiumActivatedAt())
                .premiumExpiresAt(user.getPremiumExpiresAt())
                .matchingMonthlyQuota(user.getMatchingMonthlyQuota() != null ? user.getMatchingMonthlyQuota() : 3)
                .matchingUsedThisMonth(usedThisMonth(user))
                .matchingRemainingThisMonth(remainingThisMonth(user))
                .matchingUsageMonth(user.getMatchingUsageMonth())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private static boolean isPremiumActive(User user) {
        if (user.getSubscriptionPlan() != User.SubscriptionPlan.PREMIUM) return false;
        return user.getPremiumExpiresAt() == null || user.getPremiumExpiresAt().isAfter(LocalDateTime.now());
    }

    private static int usedThisMonth(User user) {
        String currentMonth = java.time.YearMonth.now().toString();
        if (!currentMonth.equals(user.getMatchingUsageMonth())) return 0;
        return user.getMatchingUsageCount() != null ? user.getMatchingUsageCount() : 0;
    }

    private static int remainingThisMonth(User user) {
        if (isPremiumActive(user)) return -1;
        int quota = user.getMatchingMonthlyQuota() != null ? user.getMatchingMonthlyQuota() : 3;
        return Math.max(0, quota - usedThisMonth(user));
    }
}
