package com.coopconnect.auth.controller;

import com.coopconnect.auth.dto.AuthResponse;
import com.coopconnect.auth.dto.LoginRequest;
import com.coopconnect.auth.dto.RegisterRequest;
import com.coopconnect.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, register, JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.authenticate(req));
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate user with Google Identity")
    public ResponseEntity<AuthResponse> google(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.authenticateWithGoogle(body.get("credential")));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Refresh-Token") String token) {
        return ResponseEntity.ok(authService.refreshToken(token));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        authService.logout(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified");
    }

    @PostMapping("/email/send-verification")
    public ResponseEntity<String> sendEmailVerification(@RequestBody Map<String, String> body) {
        authService.requestEmailVerification(body.get("usernameOrEmail"));
        return ResponseEntity.ok("Verification email sent");
    }

    @PostMapping("/phone/send-code")
    public ResponseEntity<String> sendPhoneCode(@RequestBody Map<String, String> body) {
        authService.requestPhoneVerification(body.get("username"), body.get("phoneNumber"));
        return ResponseEntity.ok("Phone verification code sent");
    }

    @PostMapping("/phone/verify-code")
    public ResponseEntity<String> verifyPhoneCode(@RequestBody Map<String, String> body) {
        authService.verifyPhone(body.get("username"), body.get("phoneNumber"), body.get("code"));
        return ResponseEntity.ok("Phone verified");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body) {
        authService.changePassword(
                body.get("username"),
                body.get("currentPassword"),
                body.get("newPassword")
        );
        return ResponseEntity.ok("Password changed");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.requestPasswordReset(email);
        return ResponseEntity.ok("Reset email sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
                                                @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password reset");
    }
}
