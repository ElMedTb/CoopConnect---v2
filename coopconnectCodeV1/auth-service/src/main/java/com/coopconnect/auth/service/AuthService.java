package com.coopconnect.auth.service;

import com.coopconnect.auth.domain.User;
import com.coopconnect.auth.dto.AuthResponse;
import com.coopconnect.auth.dto.LoginRequest;
import com.coopconnect.auth.dto.RegisterRequest;
import com.coopconnect.auth.repository.UserRepository;
import com.coopconnect.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final TwilioSmsService twilioSmsService;
    private final RestTemplate googleRestTemplate = new RestTemplate();

    @Value("${google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists");
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already exists");

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phoneNumber(req.getPhoneNumber())
                .userType(resolvePublicUserType(req.getUserType()))
                .status(User.UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .loginAttempts(0)
                .ratingAverage(0.0)
                .ratingCount(0)
                .trustScore(0.0)
                .verificationLevel(0)
                .isFeatured(false)
                .isNegotiable(false)
                .build();

        user.setEmailVerificationToken(UUID.randomUUID().toString());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusDays(1));

        User saved = userRepository.save(user);

        try {
            emailService.sendVerificationEmail(saved.getEmail(), saved.getEmailVerificationToken());
        } catch (Exception e) {
            log.warn("Email non envoyé : {}", e.getMessage());
        }

        return buildResponse(saved);
    }

    @Transactional
    public AuthResponse authenticate(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        user.setLoginAttempts(0);
        userRepository.save(user);

        String jwt = tokenProvider.generateToken(auth);
        String refresh = tokenProvider.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getUserType().name())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken))
            throw new RuntimeException("Invalid refresh token");

        String username = tokenProvider.getUsernameFromJWT(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildResponse(user);
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String credential) {
        if (credential == null || credential.isBlank()) {
            throw new RuntimeException("Google credential is required");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new RuntimeException("Google login is not configured");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> payload = googleRestTemplate.getForObject(
                "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential,
                Map.class
        );
        if (payload == null || payload.get("email") == null) {
            throw new RuntimeException("Invalid Google credential");
        }
        String aud = String.valueOf(payload.get("aud"));
        if (!googleClientId.equals(aud)) {
            throw new RuntimeException("Google credential audience mismatch");
        }

        String email = String.valueOf(payload.get("email"));
        String firstName = String.valueOf(payload.getOrDefault("given_name", "Google"));
        String lastName = String.valueOf(payload.getOrDefault("family_name", "User"));
        String username = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9_]", "_");
        String finalUsername = uniqueUsername(username);

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .username(finalUsername)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .firstName(firstName)
                .lastName(lastName)
                .userType(User.UserType.INDIVIDUAL)
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .phoneVerified(false)
                .loginAttempts(0)
                .ratingAverage(0.0)
                .ratingCount(0)
                .trustScore(0.5)
                .verificationLevel(1)
                .isFeatured(false)
                .isNegotiable(false)
                .build()));

        user.setLastLoginAt(LocalDateTime.now());
        user.setEmailVerified(true);
        user.setStatus(User.UserStatus.ACTIVE);
        return buildResponse(userRepository.save(user));
    }

    public void logout(String token) {
        log.info("Logout — token invalidated client-side");
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        if (user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Verification token expired");
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        user.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public void requestEmailVerification(String usernameOrEmail) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return;
        }
        user.setEmailVerificationToken(UUID.randomUUID().toString());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusDays(1));
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken());
    }

    @Transactional
    public void requestPhoneVerification(String username, String phoneNumber) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new RuntimeException("Phone number is required");
        }

        String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        user.setPhoneNumber(phoneNumber);
        user.setPhoneVerified(false);
        user.setPhoneVerificationCode(code);
        user.setPhoneVerificationExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.saveAndFlush(user);

        try {
            twilioSmsService.sendVerificationCode(phoneNumber, code);
        } catch (Exception e) {
            log.warn("SMS non envoye, code conserve pour nouvelle tentative: {}", e.getMessage());
        }
    }

    @Transactional
    public void verifyPhone(String username, String phoneNumber, String code) {
        User user = findUserForPhoneVerification(username, phoneNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getPhoneVerificationCode() == null || user.getPhoneVerificationExpiresAt() == null) {
            throw new RuntimeException("No phone verification request found");
        }
        if (user.getPhoneVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Phone verification code expired");
        }
        if (code == null || !code.equals(user.getPhoneVerificationCode())) {
            throw new RuntimeException("Invalid phone verification code");
        }

        user.setPhoneVerified(true);
        user.setPhoneVerificationCode(null);
        user.setPhoneVerificationExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must contain at least 8 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private java.util.Optional<User> findUserForPhoneVerification(String username, String phoneNumber) {
        if (username != null && !username.isBlank()) {
            java.util.Optional<User> byUsername = userRepository.findByUsername(username);
            if (byUsername.isPresent()) return byUsername;
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            return userRepository.findByPhoneNumber(phoneNumber);
        }
        return java.util.Optional.empty();
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        emailService.sendPasswordResetEmail(email, token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        if (user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Reset token expired");
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    private AuthResponse buildResponse(User user) {
        return AuthResponse.builder()
                .accessToken(tokenProvider.generateTokenFromUsername(user.getUsername()))
                .refreshToken(tokenProvider.generateRefreshToken(user.getUsername()))
                .tokenType("Bearer")
                .expiresIn(3600L)
                .userId(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getUserType().name())
                .build();
    }

    private String uniqueUsername(String base) {
        String candidate = base == null || base.isBlank() ? "google_user" : base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    private User.UserType resolvePublicUserType(String rawUserType) {
        User.UserType type = User.UserType.valueOf(rawUserType != null ? rawUserType : "INDIVIDUAL");
        if (type == User.UserType.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be created from public registration");
        }
        return type;
    }
}
