package com.coopconnect.dto;

import com.coopconnect.domain.model.Organization;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrganizationResponse {
    private String id;
    private String name;
    private String description;
    private String orgType;
    private String sector;
    private String status;
    private String siret;
    private String website;
    private String phone;
    private String contactEmail;
    private String logoUrl;
    private String address;
    private String city;
    private String region;
    private String country;
    private Double latitude;
    private Double longitude;
    private Integer memberCount;
    private Integer yearFounded;
    private String valuesLabels;
    private Double ratingAverage;
    private Integer partnershipsCount;
    private Double co2SavedKg;
    private Double wasteRecycledPct;
    private String adminUsername;

    public static OrganizationResponse fromEntity(Organization o) {
        return OrganizationResponse.builder()
            .id(o.getId().toString())
            .name(o.getName())
            .description(o.getDescription())
            .orgType(o.getOrgType() != null ? o.getOrgType().name() : null)
            .sector(o.getSector() != null ? o.getSector().name() : null)
            .status(o.getStatus() != null ? o.getStatus().name() : null)
            .siret(o.getSiret())
            .website(o.getWebsite())
            .phone(o.getPhone())
            .contactEmail(o.getContactEmail())
            .logoUrl(o.getLogoUrl())
            .address(o.getAddress())
            .city(o.getCity())
            .region(o.getRegion())
            .country(o.getCountry())
            .latitude(o.getLatitude())
            .longitude(o.getLongitude())
            .memberCount(o.getMemberCount())
            .yearFounded(o.getYearFounded())
            .valuesLabels(o.getValuesLabels())
            .ratingAverage(o.getRatingAverage())
            .partnershipsCount(o.getPartnershipsCount())
            .co2SavedKg(o.getCo2SavedKg())
            .wasteRecycledPct(o.getWasteRecycledPct())
            .adminUsername(o.getAdmin() != null ? o.getAdmin().getUsername() : null)
            .build();
    }
}
