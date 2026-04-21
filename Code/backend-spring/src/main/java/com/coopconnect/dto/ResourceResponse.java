package com.coopconnect.dto;

import com.coopconnect.domain.model.Resource;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ResourceResponse {
    private String id;
    private String name;
    private String description;
    private String resourceType;
    private String category;
    private String status;
    private Double quantity;
    private String unit;
    private Double estimatedValue;
    private String conditionState;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private Boolean isRecurring;
    private String recurringFrequency;
    private String locationText;
    private Boolean deliveryAvailable;
    private Boolean pickupOnly;
    private String imageUrl;
    private Integer viewsCount;
    private Integer contactCount;
    private String organizationId;
    private String organizationName;
    private String organizationCity;
    private LocalDateTime createdAt;

    public static ResourceResponse fromEntity(Resource r) {
        return ResourceResponse.builder()
            .id(r.getId().toString())
            .name(r.getName())
            .description(r.getDescription())
            .resourceType(r.getResourceType() != null ? r.getResourceType().name() : null)
            .category(r.getCategory() != null ? r.getCategory().name() : null)
            .status(r.getStatus() != null ? r.getStatus().name() : null)
            .quantity(r.getQuantity())
            .unit(r.getUnit())
            .estimatedValue(r.getEstimatedValue())
            .conditionState(r.getConditionState())
            .availableFrom(r.getAvailableFrom())
            .availableUntil(r.getAvailableUntil())
            .isRecurring(r.getIsRecurring())
            .recurringFrequency(r.getRecurringFrequency())
            .locationText(r.getLocationText())
            .deliveryAvailable(r.getDeliveryAvailable())
            .pickupOnly(r.getPickupOnly())
            .imageUrl(r.getImageUrl())
            .viewsCount(r.getViewsCount())
            .contactCount(r.getContactCount())
            .organizationId(r.getOrganization() != null ? r.getOrganization().getId().toString() : null)
            .organizationName(r.getOrganization() != null ? r.getOrganization().getName() : null)
            .organizationCity(r.getOrganization() != null ? r.getOrganization().getCity() : null)
            .createdAt(r.getCreatedAt())
            .build();
    }
}
