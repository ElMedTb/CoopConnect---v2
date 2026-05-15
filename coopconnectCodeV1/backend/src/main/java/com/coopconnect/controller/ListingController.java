package com.coopconnect.controller;

import com.coopconnect.domain.model.Listing;
import com.coopconnect.dto.CreateListingRequest;
import com.coopconnect.dto.ListingResponse;
import com.coopconnect.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
@Tag(name = "Listings", description = "Listing management endpoints")
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    @Operation(summary = "Get all active listings", description = "Returns paginated list of active listings, optionally filtered by category")
    public ResponseEntity<Page<ListingResponse>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String category) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        if (category != null && !category.isBlank()) {
            try {
                Listing.ListingCategory cat = Listing.ListingCategory.valueOf(category.toUpperCase());
                return ResponseEntity.ok(listingService.getListingsByCategory(cat, PageRequest.of(page, size, sort)));
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(listingService.getAllActiveListings(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get listing by ID")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable UUID id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search listings by keyword (accepts 'q' or 'keyword' param)")
    public ResponseEntity<Page<ListingResponse>> searchListings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String term = (keyword != null && !keyword.isBlank()) ? keyword : q;
        if (term == null || term.isBlank()) return ResponseEntity.ok(Page.empty());
        return ResponseEntity.ok(listingService.searchListings(term, PageRequest.of(page, size)));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get listings by category")
    public ResponseEntity<Page<ListingResponse>> getByCategory(
            @PathVariable Listing.ListingCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(listingService.getListingsByCategory(category, PageRequest.of(page, size)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's listings")
    public ResponseEntity<Page<ListingResponse>> getMyListings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(listingService.getMyListings(authentication.getName(), PageRequest.of(page, size)));
    }

    @PostMapping
    @Operation(summary = "Create a new listing")
    public ResponseEntity<ListingResponse> createListing(
            @Valid @RequestBody CreateListingRequest request,
            Authentication authentication) {
        ListingResponse response = listingService.createListing(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a listing")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable UUID id,
            @Valid @RequestBody CreateListingRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(listingService.updateListing(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a listing (soft delete)")
    public ResponseEntity<Void> deleteListing(
            @PathVariable UUID id,
            Authentication authentication) {
        listingService.deleteListing(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
