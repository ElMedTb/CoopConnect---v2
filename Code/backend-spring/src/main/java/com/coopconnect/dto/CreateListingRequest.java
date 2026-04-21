package com.coopconnect.dto;

import com.coopconnect.domain.model.Listing;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create listing request")
public class CreateListingRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000)
    private String description;

    @NotNull(message = "Category is required")
    private Listing.ListingCategory category;

    private Listing.ListingSubcategory subcategory;

    @NotNull(message = "Type is required")
    @Builder.Default
    private Listing.ListingType type = Listing.ListingType.ITEM;

    @Builder.Default
    private Listing.ItemCondition condition = Listing.ItemCondition.GOOD;

    private Double estimatedValue;
    private String locationText;
    private Double latitude;
    private Double longitude;
    private Boolean isPickupOnly;
    private Boolean isDeliveryAvailable;
    private Integer deliveryRadiusKm;
}
