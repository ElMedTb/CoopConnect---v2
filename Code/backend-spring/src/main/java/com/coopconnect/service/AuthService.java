package com.coopconnect.service;

import com.coopconnect.domain.model.User;
import com.coopconnect.dto.AuthResponse;
import com.coopconnect.dto.LoginRequest;
import com.coopconnect.dto.RegisterRequest;
import com.coopconnect.repository.UserRepository;
import com.coopconnect.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling authentication operations.
 * Provides user registration, login, and token management.
 *
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user: {}", registerRequest.getEmail());

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .userType(User.UserType.valueOf(
                        registerRequest.getUserType() != null ? registerRequest.getUserType() : "INDIVIDUAL"))
                .status(User.UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .loginAttempts(0)
                .ratingAverage(0.0)
                .ratingCount(0)
                .trustScore(0.0)
                .verificationLevel(0)
                .build();

        user.setEmailVerificationToken(generateVerificationToken());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusDays(1));

        User savedUser = userRepository.save(user);

        // Non-fatal email sending — log errors instead of crashing
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getEmailVerificationToken());
        } catch (Exception e) {
            log.warn("Could not send verification email to {} — continuing without email: {}",
                    savedUser.getEmail(), e.getMessage());
        }

        return createAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse authenticate(LoginRequest loginRequest) {
        log.info("Authenticating user: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        user.setLoginAttempts(0);
        userRepository.save(user);

        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getUserType().name())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromJWT(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = tokenProvider.generateTokenFromUsername(username);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getUserType().name())
                .build();
    }

    @Transactional
    public void logout(String token) {
        log.info("Logging out user");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromJWT(token);
            log.info("User {} logged out successfully", username);
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        log.info("Verifying email with token: {}", token);

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        user.setStatus(User.UserStatus.ACTIVE);

        userRepository.save(user);

        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public void requestPasswordReset(String email) {
        log.info("Requesting password reset for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = generateVerificationToken();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));

        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(email, resetToken);
        } catch (Exception e) {
            log.warn("Could not send password reset email to {} — token saved in DB: {}",
                    email, e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token");

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);

        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    private AuthResponse createAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(tokenProvider.generateTokenFromUsername(user.getUsername()))
                .refreshToken(tokenProvider.generateRefreshToken(user.getUsername()))
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getUserType().name())
                .build();
    }
}
