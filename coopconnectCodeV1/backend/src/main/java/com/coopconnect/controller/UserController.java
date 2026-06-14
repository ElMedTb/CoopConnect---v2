package com.coopconnect.controller;

import com.coopconnect.dto.UserProfileResponse;
import com.coopconnect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(authentication.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    @Operation(summary = "Get all users (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserProfileResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getAllUsers(PageRequest.of(page, size)));
    }

    @PutMapping("/{id}/subscription")
    @Operation(summary = "Update user subscription plan (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateSubscription(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.updateSubscriptionPlan(
                id,
                asSubscriptionPlan(body.get("subscriptionPlan")),
                asDateTime(body.get("premiumExpiresAt")),
                asInteger(body.get("matchingMonthlyQuota"))
        ));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(
                authentication.getName(),
                updates.get("firstName"),
                updates.get("lastName"),
                updates.get("bio"),
                updates.get("city"),
                updates.get("country"),
                updates.get("phoneNumber")
        ));
    }

    @PutMapping("/me/onboarding")
    @Operation(summary = "Complete onboarding with location and credibility details")
    public ResponseEntity<UserProfileResponse> completeOnboarding(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.completeOnboarding(
                authentication.getName(),
                asString(body.get("email")),
                asString(body.get("firstName")),
                asString(body.get("lastName")),
                asString(body.get("phoneNumber")),
                asString(body.get("address")),
                asString(body.get("city")),
                asString(body.get("country")),
                asDouble(body.get("latitude")),
                asDouble(body.get("longitude")),
                asString(body.get("organizationName")),
                asString(body.get("registrationNumber")),
                asString(body.get("ice")),
                asString(body.get("businessSector")),
                asString(body.get("credibilityNotes"))
        ));
    }

    @PutMapping("/me/phone-verified")
    @Operation(summary = "Mark current user's phone as verified after auth-service SMS validation")
    public ResponseEntity<UserProfileResponse> markPhoneVerified(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.markPhoneVerified(
                authentication.getName(),
                body.get("phoneNumber")
        ));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        userService.changePassword(
                authentication.getName(),
                body.get("currentPassword"),
                body.get("newPassword")
        );
        return ResponseEntity.noContent().build();
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Double asDouble(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        if (value instanceof Number number) return number.doubleValue();
        return Double.parseDouble(value.toString());
    }

    private Integer asInteger(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        if (value instanceof Number number) return number.intValue();
        return Integer.parseInt(value.toString());
    }

    private LocalDateTime asDateTime(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        return LocalDateTime.parse(value.toString());
    }

    private com.coopconnect.domain.model.User.SubscriptionPlan asSubscriptionPlan(Object value) {
        if (value == null || value.toString().isBlank()) return com.coopconnect.domain.model.User.SubscriptionPlan.STANDARD;
        return com.coopconnect.domain.model.User.SubscriptionPlan.valueOf(value.toString().trim().toUpperCase());
    }
}
