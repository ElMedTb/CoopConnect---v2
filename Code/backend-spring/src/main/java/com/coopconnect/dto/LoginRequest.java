package com.coopconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for login requests.
 * Contains user credentials for authentication.
 *
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login request")
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Schema(description = "Username or email", example = "john.doe")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Schema(description = "User password", example = "Password123!")
    private String password;

    @Schema(description = "Remember me flag", example = "false")
    @Builder.Default
    private Boolean rememberMe = false;
}
