package com.coopconnect.dto;

import com.coopconnect.domain.model.Resource;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateResourceRequest {
    @NotBlank private String name;
    private String description;
    @NotNull private Resource.ResourceType resourceType;
    @NotNull private Resource.ResourceCategory category;
    private Double quantity;
    private String unit;
    private Double estimatedValue;
    private String conditionState;
    private Boolean isRecurring;
    private String recurringFrequency;
    private String locationText;
    private Boolean deliveryAvailable;
    private Boolean pickupOnly;
    private Integer maxDeliveryKm;
}
