package com.coopconnect.dto;

import com.coopconnect.domain.model.Listing;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Listing response")
public class ListingResponse {

    private String id;
    private String title;
    private String description;
    private String category;
    private String subcategory;
    private String type;
    private String condition;
    private String status;
    private Double estimatedValue;
    private String locationText;
    private Double latitude;
    private Double longitude;
    private Boolean isPickupOnly;
    private Boolean isDeliveryAvailable;
    private Integer viewsCount;
    private Integer likesCount;
    private String ownerUsername;
    private String ownerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ListingResponse fromEntity(Listing listing) {
        return ListingResponse.builder()
                .id(listing.getId().toString())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory() != null ? listing.getCategory().name() : null)
                .subcategory(listing.getSubcategory() != null ? listing.getSubcategory().name() : null)
                .type(listing.getType() != null ? listing.getType().name() : null)
                .condition(listing.getCondition() != null ? listing.getCondition().name() : null)
                .status(listing.getStatus() != null ? listing.getStatus().name() : null)
                .estimatedValue(listing.getEstimatedValue())
                .locationText(listing.getLocationText())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .isPickupOnly(listing.getIsPickupOnly())
                .isDeliveryAvailable(listing.getIsDeliveryAvailable())
                .viewsCount(listing.getViewsCount())
                .likesCount(listing.getLikesCount())
                .ownerUsername(listing.getOwner() != null ? listing.getOwner().getUsername() : null)
                .ownerId(listing.getOwner() != null ? listing.getOwner().getId().toString() : null)
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
