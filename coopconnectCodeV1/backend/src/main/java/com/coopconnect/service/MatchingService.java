package com.coopconnect.service;

import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.MatchingQuotaResponse;
import com.coopconnect.dto.MatchingRequest;
import com.coopconnect.dto.MatchingResponse;
import com.coopconnect.repository.ListingRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.matching-service.url:http://localhost:8000}")
    private String matchingServiceUrl;

    @Transactional
    public MatchingResponse findMatchesForListing(String username, UUID listingId, int maxResults, double maxDistanceKm) {
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Listing query = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));

        String ownerUsername = query.getOwner() != null ? query.getOwner().getUsername() : null;
        if (!requester.getUserType().equals(User.UserType.ADMIN) && !username.equals(ownerUsername)) {
            throw new RuntimeException("Vous pouvez lancer le matching uniquement sur vos propres annonces");
        }

        List<Listing> candidates = listingRepository
                .findAllActive(PageRequest.of(0, 200))
                .getContent()
                .stream()
                // Exclure l'annonce elle-même ET les autres annonces du même propriétaire
                .filter(l -> !l.getId().equals(listingId))
                .filter(l -> ownerUsername == null || !ownerUsername.equals(
                        l.getOwner() != null ? l.getOwner().getUsername() : null))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            return MatchingResponse.builder()
                    .queryId(listingId.toString())
                    .matches(Collections.emptyList())
                    .totalCandidates(0)
                    .quota(buildQuotaResponse(requester))
                    .build();
        }

        ensureCanUseMatching(requester);

        // Map id → listing pour enrichir les résultats avec le titre
        Map<String, Listing> idToListing = candidates.stream()
                .collect(Collectors.toMap(l -> l.getId().toString(), l -> l));

        MatchingRequest request = buildMatchingRequest(query, candidates, maxResults, maxDistanceKm);
        MatchingResponse response = callMatchingService(request, listingId.toString());
        consumeMatchingUsage(requester);
        response.setQuota(buildQuotaResponse(requester));

        // Enrichir chaque résultat avec le titre et l'owner pour affichage frontend
        if (response.getMatches() != null) {
            response.getMatches().forEach(m -> {
                Listing l = idToListing.get(m.getListingId());
                if (l != null) {
                    m.setTitle(l.getTitle());
                    m.setOwnerUsername(l.getOwner() != null ? l.getOwner().getUsername() : null);
                }
            });
        }

        return response;
    }

    @Transactional
    public MatchingResponse getPersonalizedRecommendations(
            String username, List<String> preferredCategories,
            Double lat, Double lon, int maxResults) {
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Listing> allListings = listingRepository
                .findAllActive(PageRequest.of(0, 200))
                .getContent();

        if (allListings.isEmpty()) {
            return MatchingResponse.builder()
                    .queryId(username)
                    .matches(Collections.emptyList())
                    .totalCandidates(0)
                    .quota(buildQuotaResponse(requester))
                    .build();
        }

        ensureCanUseMatching(requester);

        String userText = preferredCategories.isEmpty()
                ? "ressources échanges coopération économie circulaire"
                : String.join(" ", preferredCategories);

        MatchingRequest.ListingDto userQuery = MatchingRequest.ListingDto.builder()
                .id("__user__:" + username)
                .title(userText)
                .description(userText)
                .latitude(lat)
                .longitude(lon)
                .exchangeIntent("NEED")
                .tags(preferredCategories)
                .build();

        List<MatchingRequest.ListingDto> candidateDtos = allListings.stream()
                .map(this::toListingDto)
                .collect(Collectors.toList());

        MatchingRequest request = MatchingRequest.builder()
                .query(userQuery)
                .candidates(candidateDtos)
                .maxResults(maxResults)
                .maxDistanceKm(100.0)
                .build();

        MatchingResponse response = callMatchingService(request, username);
        consumeMatchingUsage(requester);
        response.setQuota(buildQuotaResponse(requester));
        return response;
    }

    @Transactional
    public MatchingQuotaResponse getQuota(String username) {
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        normalizeSubscription(requester);
        resetUsageIfNeeded(requester);
        return buildQuotaResponse(requester);
    }

    private MatchingRequest buildMatchingRequest(
            Listing query, List<Listing> candidates, int maxResults, double maxDistanceKm) {

        MatchingRequest.ListingDto queryDto = toListingDto(query);
        List<MatchingRequest.ListingDto> candidateDtos = candidates.stream()
                .map(this::toListingDto)
                .collect(Collectors.toList());

        return MatchingRequest.builder()
                .query(queryDto)
                .candidates(candidateDtos)
                .maxResults(maxResults)
                .maxDistanceKm(maxDistanceKm)
                .build();
    }

    private MatchingRequest.ListingDto toListingDto(Listing l) {
        List<String> tags = l.getAiMatchingTags() != null
                ? Arrays.asList(l.getAiMatchingTags().split(","))
                : Collections.emptyList();

        String city = null;
        if (l.getLocationText() != null && l.getLocationText().contains(",")) {
            city = l.getLocationText().split(",")[0].trim();
        } else if (l.getLocationText() != null) {
            city = l.getLocationText().trim();
        }

        return MatchingRequest.ListingDto.builder()
                .id(l.getId().toString())
                .title(l.getTitle())
                .description(l.getDescription())
                .category(l.getCategory() != null ? l.getCategory().name() : null)
                .subcategory(l.getSubcategory() != null ? l.getSubcategory().name() : null)
                .listingType(l.getType() != null ? l.getType().name() : null)
                .exchangeIntent(l.getExchangeIntent() != null ? l.getExchangeIntent().name() : null)
                .tags(tags)
                .latitude(l.getLatitude())
                .longitude(l.getLongitude())
                .city(city)
                .ownerTrustScore(l.getOwner() != null ? l.getOwner().getTrustScore() : 3.0)
                .estimatedValue(l.getEstimatedValue())
                .build();
    }

    private MatchingResponse callMatchingService(MatchingRequest request, String fallbackId) {
        try {
            String url = matchingServiceUrl + "/api/match/";
            MatchingResponse response = restTemplate.postForObject(url, request, MatchingResponse.class);
            if (response == null) {
                throw new RuntimeException("Empty response from matching service");
            }
            return response;
        } catch (Exception e) {
            log.warn("Matching service unavailable, returning empty results: {}", e.getMessage());
            return MatchingResponse.builder()
                    .queryId(fallbackId)
                    .matches(Collections.emptyList())
                    .totalCandidates(0)
                    .build();
        }
    }

    private void ensureCanUseMatching(User user) {
        normalizeSubscription(user);
        resetUsageIfNeeded(user);
        if (isPremiumActive(user)) {
            return;
        }

        int quota = user.getMatchingMonthlyQuota() != null ? user.getMatchingMonthlyQuota() : 3;
        int used = user.getMatchingUsageCount() != null ? user.getMatchingUsageCount() : 0;
        if (used >= quota) {
            throw new RuntimeException("Quota matching mensuel atteint. Le plan standard permet 3 analyses IA par mois.");
        }
    }

    private void consumeMatchingUsage(User user) {
        normalizeSubscription(user);
        resetUsageIfNeeded(user);
        if (isPremiumActive(user)) {
            userRepository.save(user);
            return;
        }

        int used = user.getMatchingUsageCount() != null ? user.getMatchingUsageCount() : 0;
        user.setMatchingUsageCount(used + 1);
        userRepository.save(user);
    }

    private void resetUsageIfNeeded(User user) {
        String currentMonth = YearMonth.now().toString();
        if (!currentMonth.equals(user.getMatchingUsageMonth())) {
            user.setMatchingUsageMonth(currentMonth);
            user.setMatchingUsageCount(0);
        }
        if (user.getMatchingMonthlyQuota() == null) {
            user.setMatchingMonthlyQuota(3);
        }
    }

    private void normalizeSubscription(User user) {
        if (user.getSubscriptionPlan() == null) {
            user.setSubscriptionPlan(User.SubscriptionPlan.STANDARD);
        }
        if (user.getSubscriptionPlan() == User.SubscriptionPlan.PREMIUM
                && user.getPremiumExpiresAt() != null
                && user.getPremiumExpiresAt().isBefore(LocalDateTime.now())) {
            user.setSubscriptionPlan(User.SubscriptionPlan.STANDARD);
        }
    }

    private boolean isPremiumActive(User user) {
        return user.getSubscriptionPlan() == User.SubscriptionPlan.PREMIUM
                && (user.getPremiumExpiresAt() == null || user.getPremiumExpiresAt().isAfter(LocalDateTime.now()));
    }

    private MatchingQuotaResponse buildQuotaResponse(User user) {
        normalizeSubscription(user);
        resetUsageIfNeeded(user);
        boolean premiumActive = isPremiumActive(user);
        int quota = user.getMatchingMonthlyQuota() != null ? user.getMatchingMonthlyQuota() : 3;
        int used = user.getMatchingUsageCount() != null ? user.getMatchingUsageCount() : 0;

        return MatchingQuotaResponse.builder()
                .subscriptionPlan(user.getSubscriptionPlan().name())
                .premiumActive(premiumActive)
                .monthlyQuota(quota)
                .usedThisMonth(premiumActive ? 0 : used)
                .remainingThisMonth(premiumActive ? -1 : Math.max(0, quota - used))
                .usageMonth(user.getMatchingUsageMonth())
                .premiumExpiresAt(user.getPremiumExpiresAt() != null ? user.getPremiumExpiresAt().toString() : null)
                .build();
    }
}
