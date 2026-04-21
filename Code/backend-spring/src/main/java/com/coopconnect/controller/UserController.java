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
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Page<UserProfileResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getAllUsers(PageRequest.of(page, size)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(
                authentication.getName(),
                updates.get("bio"),
                updates.get("city"),
                updates.get("country"),
                updates.get("phoneNumber")
        ));
    }
}
