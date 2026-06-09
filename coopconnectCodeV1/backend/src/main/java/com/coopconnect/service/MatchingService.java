package com.coopconnect.service;

import com.coopconnect.domain.model.Listing;
import com.coopconnect.dto.MatchingRequest;
import com.coopconnect.dto.MatchingResponse;
import com.coopconnect.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

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
    private final RestTemplate restTemplate;

    @Value("${app.matching-service.url:http://localhost:8000}")
    private String matchingServiceUrl;

    @Transactional(readOnly = true)
    public MatchingResponse findMatchesForListing(UUID listingId, int maxResults, double maxDistanceKm) {
        Listing query = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));

        String ownerUsername = query.getOwner() != null ? query.getOwner().getUsername() : null;

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
                    .build();
        }

        // Map id → listing pour enrichir les résultats avec le titre
        Map<String, Listing> idToListing = candidates.stream()
                .collect(Collectors.toMap(l -> l.getId().toString(), l -> l));

        MatchingRequest request = buildMatchingRequest(query, candidates, maxResults, maxDistanceKm);
        MatchingResponse response = callMatchingService(request, listingId.toString());

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

    @Transactional(readOnly = true)
    public MatchingResponse getPersonalizedRecommendations(
            String username, List<String> preferredCategories,
            Double lat, Double lon, int maxResults) {

        List<Listing> allListings = listingRepository
                .findAllActive(PageRequest.of(0, 200))
                .getContent();

        if (allListings.isEmpty()) {
            return MatchingResponse.builder()
                    .queryId(username)
                    .matches(Collections.emptyList())
                    .totalCandidates(0)
                    .build();
        }

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

        return callMatchingService(request, username);
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
}
