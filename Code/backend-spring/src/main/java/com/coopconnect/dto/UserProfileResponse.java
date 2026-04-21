package com.coopconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.coopconnect.domain.model.User;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String bio;
    private String profileImageUrl;
    private String userType;
    private String status;
    private Boolean emailVerified;
    private Double ratingAverage;
    private Integer ratingCount;
    private Double trustScore;
    private String city;
    private String country;
    private LocalDateTime createdAt;

    public static UserProfileResponse fromEntity(User user) {
        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .userType(user.getUserType().name())
                .status(user.getStatus().name())
                .emailVerified(user.getEmailVerified())
                .ratingAverage(user.getRatingAverage())
                .ratingCount(user.getRatingCount())
                .trustScore(user.getTrustScore())
                .city(user.getCity())
                .country(user.getCountry())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
