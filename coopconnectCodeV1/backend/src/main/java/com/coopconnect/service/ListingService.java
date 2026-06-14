package com.coopconnect.service;

import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.CreateListingRequest;
import com.coopconnect.dto.ListingResponse;
import com.coopconnect.repository.ListingRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final CoreUserProvisioningService userProvisioningService;

    @Transactional(readOnly = true)
    public Page<ListingResponse> getAllActiveListings(Pageable pageable) {
        return listingRepository.findAllActive(pageable).map(ListingResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(UUID id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return ListingResponse.fromEntity(listing);
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> getListingsByOwner(UUID ownerId, Pageable pageable) {
        return listingRepository.findByOwnerId(ownerId, pageable).map(ListingResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> searchListings(String keyword, Pageable pageable) {
        return listingRepository.searchByKeyword(keyword, pageable).map(ListingResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> getListingsByCategory(Listing.ListingCategory category, Pageable pageable) {
        return listingRepository.findByCategory(category, pageable).map(ListingResponse::fromEntity);
    }

    @Transactional
    public ListingResponse createListing(CreateListingRequest request, String username) {
        User owner = userProvisioningService.getOrCreateByUsername(username);

        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .subcategory(request.getSubcategory())
                .type(request.getType() != null ? request.getType() : Listing.ListingType.ITEM)
                .condition(request.getCondition() != null ? request.getCondition() : Listing.ItemCondition.GOOD)
                .status(Listing.ListingStatus.ACTIVE)
                .owner(owner)
                .estimatedValue(request.getEstimatedValue())
                .locationText(request.getLocationText())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isPickupOnly(request.getIsPickupOnly() != null ? request.getIsPickupOnly() : false)
                .isDeliveryAvailable(request.getIsDeliveryAvailable() != null ? request.getIsDeliveryAvailable() : false)
                .deliveryRadiusKm(request.getDeliveryRadiusKm())
                .isNegotiable(true)
                .isFeatured(false)
                .viewsCount(0)
                .likesCount(0)
                .inquiriesCount(0)
                .autoRenew(false)
                .build();

        Listing saved = listingRepository.save(listing);
        log.info("Listing created: {} by user {}", saved.getTitle(), username);
        return ListingResponse.fromEntity(saved);
    }

    @Transactional
    public ListingResponse updateListing(UUID id, CreateListingRequest request, String username) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("You can only update your own listings");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setSubcategory(request.getSubcategory());
        if (request.getType() != null) listing.setType(request.getType());
        if (request.getCondition() != null) listing.setCondition(request.getCondition());
        listing.setEstimatedValue(request.getEstimatedValue());
        listing.setLocationText(request.getLocationText());
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());

        Listing saved = listingRepository.save(listing);
        log.info("Listing updated: {}", saved.getTitle());
        return ListingResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteListing(UUID id, String username) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (!listing.getOwner().getUsername().equals(username)) {
            throw new RuntimeException("You can only delete your own listings");
        }

        listing.setIsActive(false);
        listing.setStatus(Listing.ListingStatus.DELETED);
        listingRepository.save(listing);
        log.info("Listing soft-deleted: {}", id);
    }

    @Transactional
    public Page<ListingResponse> getMyListings(String username, Pageable pageable) {
        User owner = userProvisioningService.getOrCreateByUsername(username);
        return listingRepository.findByOwnerId(owner.getId(), pageable).map(ListingResponse::fromEntity);
    }

    public long countActiveListingsByOwner(UUID ownerId) {
        return listingRepository.countActiveByOwner(ownerId);
    }
}
