package com.coopconnect.controller;

import com.coopconnect.dto.AuthResponse;
import com.coopconnect.dto.LoginRequest;
import com.coopconnect.dto.RegisterRequest;
import com.coopconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication operations.
 * Provides endpoints for user registration, login, and token refresh.
 *
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user",
              description = "Creates a new user account with email verification")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Registering new user: {}", registerRequest.getEmail());
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user",
              description = "Authenticates user and returns JWT token")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "423", description = "Account locked")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("User login attempt: {}", loginRequest.getUsername());
        AuthResponse response = authService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token",
              description = "Generates new access token using refresh token")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
        log.info("Token refresh request");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user",
              description = "Invalidates user token and logs out")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        log.info("User logout request");
        authService.logout(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email",
              description = "Verifies user email address")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        log.info("Email verification request");
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset",
              description = "Sends password reset email")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        log.info("Password reset request for: {}", email);
        authService.requestPasswordReset(email);
        return ResponseEntity.ok("Password reset email sent");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password",
              description = "Resets user password with token")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
                                         @RequestParam String newPassword) {
        log.info("Password reset with token");
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password reset successfully");
    }
}
