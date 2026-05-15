package com.coopconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for authentication responses.
 * Contains JWT tokens and user information.
 *
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response")
public class AuthResponse {

    @Schema(description = "JWT access token")
    private String accessToken;

    @Schema(description = "JWT refresh token")
    private String refreshToken;

    @Schema(description = "Token type", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @Schema(description = "Token expiration in seconds", example = "3600")
    private Long expiresIn;

    @Schema(description = "User unique identifier")
    private String userId;

    @Schema(description = "User email address")
    private String email;

    @Schema(description = "User full name")
    private String fullName;

    @Schema(description = "User role", example = "INDIVIDUAL")
    private String role;

    @Schema(description = "Username")
    private String username;
}
