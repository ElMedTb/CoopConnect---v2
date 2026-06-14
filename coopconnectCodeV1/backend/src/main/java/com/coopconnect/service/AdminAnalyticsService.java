package com.coopconnect.service;

import com.coopconnect.domain.model.Exchange;
import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.AdminExchangeResponse;
import com.coopconnect.dto.AdminStatsResponse;
import com.coopconnect.repository.ExchangeRepository;
import com.coopconnect.repository.ListingRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ExchangeRepository exchangeRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long premiumUsers = userRepository.countBySubscriptionPlan(User.SubscriptionPlan.PREMIUM);
        long standardUsers = Math.max(0, totalUsers - premiumUsers);
        long emailVerified = userRepository.countByEmailVerifiedTrue();
        long phoneVerified = userRepository.countByPhoneVerifiedTrue();
        long onboardingDone = userRepository.countByOnboardingCompletedTrue();
        long credibilityVerified = userRepository.countByCredibilityVerifiedTrue();

        long totalListings = listingRepository.count();
        long activeListings = listingRepository.countByStatus(Listing.ListingStatus.ACTIVE);
        long exchangedListings = listingRepository.countByStatus(Listing.ListingStatus.EXCHANGED);

        long totalExchanges = exchangeRepository.count();
        long requested = exchangeRepository.countByStatus(Exchange.ExchangeStatus.REQUESTED);
        long accepted = exchangeRepository.countByStatus(Exchange.ExchangeStatus.ACCEPTED);
        long inProgress = exchangeRepository.countByStatus(Exchange.ExchangeStatus.IN_PROGRESS);
        long completed = exchangeRepository.countByStatus(Exchange.ExchangeStatus.COMPLETED);
        long rejected = exchangeRepository.countByStatus(Exchange.ExchangeStatus.REJECTED);
        long cancelled = exchangeRepository.countByStatus(Exchange.ExchangeStatus.CANCELLED);
        long disputed = exchangeRepository.countByStatus(Exchange.ExchangeStatus.DISPUTED);

        List<Exchange> completedWithDate = exchangeRepository.findCompletedWithCompletionDate();
        long qrCompleted = completedWithDate.stream()
                .filter(e -> Boolean.TRUE.equals(e.getRequesterQrConfirmed()) && Boolean.TRUE.equals(e.getProviderQrConfirmed()))
                .count();
        Double averageCompletionHours = completedWithDate.isEmpty()
                ? null
                : completedWithDate.stream()
                    .filter(e -> e.getCreatedAt() != null && e.getCompletionConfirmedAt() != null)
                    .mapToLong(e -> Duration.between(e.getCreatedAt(), e.getCompletionConfirmedAt()).toHours())
                    .average()
                    .orElse(0);

        MatchingUsage usage = calculateMatchingUsage(userRepository.findAll());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .standardUsers(standardUsers)
                .premiumUsers(premiumUsers)
                .premiumConversionRate(rate(premiumUsers, totalUsers))
                .emailVerificationRate(rate(emailVerified, totalUsers))
                .phoneVerificationRate(rate(phoneVerified, totalUsers))
                .onboardingCompletionRate(rate(onboardingDone, totalUsers))
                .credibilityVerificationRate(rate(credibilityVerified, totalUsers))
                .usersByType(userTypeCounts())
                .totalListings(totalListings)
                .activeListings(activeListings)
                .exchangedListings(exchangedListings)
                .activeListingsPerActiveUser(activeUsers == 0 ? 0 : round((double) activeListings / activeUsers))
                .listingsByStatus(listingStatusCounts())
                .totalExchanges(totalExchanges)
                .requestedExchanges(requested)
                .acceptedExchanges(accepted)
                .inProgressExchanges(inProgress)
                .completedExchanges(completed)
                .rejectedExchanges(rejected)
                .cancelledExchanges(cancelled)
                .disputedExchanges(disputed)
                .exchangeCompletionRate(rate(completed, totalExchanges))
                .exchangeAcceptanceRate(rate(accepted + inProgress + completed, totalExchanges))
                .exchangeCancellationRate(rate(cancelled + rejected, totalExchanges))
                .qrCompletionRate(rate(qrCompleted, completed))
                .averageCompletionHours(averageCompletionHours != null ? round(averageCompletionHours) : null)
                .exchangesByStatus(exchangeStatusCounts())
                .monthlyMatchingUsage(usage.monthlyMatchingUsage)
                .standardUsersAtQuota(usage.standardUsersAtQuota)
                .standardUsersWithRemainingQuota(usage.standardUsersWithRemainingQuota)
                .totalRemainingStandardQuota(usage.totalRemainingStandardQuota)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<AdminExchangeResponse> getExchanges(Pageable pageable) {
        return exchangeRepository.findAllForAdmin(pageable).map(AdminExchangeResponse::fromEntity);
    }

    private Map<String, Long> userTypeCounts() {
        Map<String, Long> values = new LinkedHashMap<>();
        Arrays.stream(User.UserType.values()).forEach(type -> values.put(type.name(), userRepository.countByUserType(type)));
        return values;
    }

    private Map<String, Long> listingStatusCounts() {
        Map<String, Long> values = new LinkedHashMap<>();
        Arrays.stream(Listing.ListingStatus.values()).forEach(status -> values.put(status.name(), listingRepository.countByStatus(status)));
        return values;
    }

    private Map<String, Long> exchangeStatusCounts() {
        Map<String, Long> values = new LinkedHashMap<>();
        Arrays.stream(Exchange.ExchangeStatus.values()).forEach(status -> values.put(status.name(), exchangeRepository.countByStatus(status)));
        return values;
    }

    private MatchingUsage calculateMatchingUsage(List<User> users) {
        String currentMonth = YearMonth.now().toString();
        long usage = 0;
        long atQuota = 0;
        long withRemaining = 0;
        long remainingTotal = 0;

        for (User user : users) {
            if (user.getSubscriptionPlan() == User.SubscriptionPlan.PREMIUM) {
                continue;
            }
            int quota = user.getMatchingMonthlyQuota() != null ? user.getMatchingMonthlyQuota() : 3;
            int used = currentMonth.equals(user.getMatchingUsageMonth()) && user.getMatchingUsageCount() != null
                    ? user.getMatchingUsageCount()
                    : 0;
            int remaining = Math.max(0, quota - used);
            usage += used;
            remainingTotal += remaining;
            if (remaining == 0) atQuota++;
            else withRemaining++;
        }

        return new MatchingUsage(usage, atQuota, withRemaining, remainingTotal);
    }

    private double rate(long value, long total) {
        if (total <= 0) return 0;
        return round((value * 100.0) / total);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record MatchingUsage(long monthlyMatchingUsage,
                                 long standardUsersAtQuota,
                                 long standardUsersWithRemainingQuota,
                                 long totalRemainingStandardQuota) {}
}
