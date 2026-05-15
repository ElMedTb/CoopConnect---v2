package com.coopconnect.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 8, max = 100) private String password;
    @NotBlank @Size(min = 2, max = 50) private String firstName;
    @NotBlank @Size(min = 2, max = 50) private String lastName;
    private String phoneNumber;
    @Builder.Default private String userType = "INDIVIDUAL";
}
