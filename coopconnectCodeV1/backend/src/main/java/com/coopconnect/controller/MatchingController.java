package com.coopconnect.controller;

import com.coopconnect.dto.MatchingResponse;
import com.coopconnect.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/listing/{listingId}")
    public ResponseEntity<MatchingResponse> findMatchesForListing(
            @PathVariable UUID listingId,
            @RequestParam(defaultValue = "10") int maxResults,
            @RequestParam(defaultValue = "100") double maxDistanceKm) {
        return ResponseEntity.ok(matchingService.findMatchesForListing(listingId, maxResults, maxDistanceKm));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<MatchingResponse> getPersonalizedRecommendations(
            Authentication auth,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "10") int maxResults) {
        return ResponseEntity.ok(matchingService.getPersonalizedRecommendations(
                auth.getName(),
                categories != null ? categories : List.of(),
                lat, lon, maxResults));
    }
}
