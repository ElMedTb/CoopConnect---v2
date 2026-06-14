package com.coopconnect.service;

import com.coopconnect.domain.model.User;
import com.coopconnect.dto.UserProfileResponse;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileResponse.fromEntity(user);
    }

    public UserProfileResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileResponse.fromEntity(user);
    }

    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserProfileResponse::fromEntity);
    }

    @Transactional
    public UserProfileResponse updateSubscriptionPlan(UUID userId,
                                                      User.SubscriptionPlan plan,
                                                      LocalDateTime premiumExpiresAt,
                                                      Integer monthlyQuota) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (plan == null) {
            throw new RuntimeException("Subscription plan is required");
        }

        user.setSubscriptionPlan(plan);
        if (monthlyQuota != null && monthlyQuota > 0) {
            user.setMatchingMonthlyQuota(monthlyQuota);
        } else if (user.getMatchingMonthlyQuota() == null) {
            user.setMatchingMonthlyQuota(3);
        }

        if (plan == User.SubscriptionPlan.PREMIUM) {
            if (user.getPremiumActivatedAt() == null) {
                user.setPremiumActivatedAt(LocalDateTime.now());
            }
            user.setPremiumExpiresAt(premiumExpiresAt);
        } else {
            user.setPremiumActivatedAt(null);
            user.setPremiumExpiresAt(null);
        }

        if (user.getMatchingUsageMonth() == null) {
            user.setMatchingUsageMonth(YearMonth.now().toString());
            user.setMatchingUsageCount(0);
        }

        return UserProfileResponse.fromEntity(userRepository.save(user));
    }

    public Page<UserProfileResponse> getUsersByType(User.UserType userType, Pageable pageable) {
        return userRepository.findByUserTypeAndActive(userType, pageable).map(UserProfileResponse::fromEntity);
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, String firstName, String lastName,
                                             String bio, String city, String country, String phoneNumber) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (firstName != null && !firstName.isBlank()) user.setFirstName(firstName);
        if (lastName != null && !lastName.isBlank()) user.setLastName(lastName);
        if (bio != null) user.setBio(bio);
        if (city != null) user.setCity(city);
        if (country != null) user.setCountry(country);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);

        User saved = userRepository.save(user);
        log.info("Profile updated for user: {}", username);
        return UserProfileResponse.fromEntity(saved);
    }

    @Transactional
    public UserProfileResponse completeOnboarding(String username,
                                                  String email,
                                                  String firstName,
                                                  String lastName,
                                                  String phoneNumber,
                                                  String address,
                                                  String city,
                                                  String country,
                                                  Double latitude,
                                                  Double longitude,
                                                  String organizationName,
                                                  String registrationNumber,
                                                  String ice,
                                                  String businessSector,
                                                  String credibilityNotes) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (email != null && !email.isBlank() && user.getEmail().endsWith("@pending.coopconnect.local")) {
            user.setEmail(email);
        }
        if (firstName != null && !firstName.isBlank()) user.setFirstName(firstName);
        if (lastName != null && !lastName.isBlank()) user.setLastName(lastName);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (address != null) user.setAddress(address);
        if (city != null) user.setCity(city);
        if (country != null) user.setCountry(country);
        if (latitude != null) user.setLatitude(latitude);
        if (longitude != null) user.setLongitude(longitude);
        if (organizationName != null) user.setOrganizationName(organizationName);
        if (registrationNumber != null) user.setRegistrationNumber(registrationNumber);
        if (ice != null) user.setIce(ice);
        if (businessSector != null) user.setBusinessSector(businessSector);
        if (credibilityNotes != null) user.setCredibilityNotes(credibilityNotes);

        user.setOnboardingCompleted(true);
        user.setVerificationLevel(calculateVerificationLevel(user));
        user.setTrustScore(calculateTrustScore(user));
        return UserProfileResponse.fromEntity(userRepository.save(user));
    }

    private int calculateVerificationLevel(User user) {
        int level = 0;
        if (Boolean.TRUE.equals(user.getEmailVerified())) level++;
        if (Boolean.TRUE.equals(user.getPhoneVerified())) level++;
        if (user.getLatitude() != null && user.getLongitude() != null) level++;
        if (user.getRegistrationNumber() != null && !user.getRegistrationNumber().isBlank()) level++;
        if (user.getIce() != null && !user.getIce().isBlank()) level++;
        return Math.min(level, 5);
    }

    private double calculateTrustScore(User user) {
        double score = 2.5;
        score += Boolean.TRUE.equals(user.getEmailVerified()) ? 0.5 : 0.0;
        score += Boolean.TRUE.equals(user.getPhoneVerified()) ? 0.5 : 0.0;
        score += user.getLatitude() != null && user.getLongitude() != null ? 0.5 : 0.0;
        score += user.getRegistrationNumber() != null && !user.getRegistrationNumber().isBlank() ? 0.5 : 0.0;
        score += user.getIce() != null && !user.getIce().isBlank() ? 0.5 : 0.0;
        return Math.min(5.0, score);
    }

    @Transactional
    public UserProfileResponse markPhoneVerified(String username, String phoneNumber) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            user.setPhoneNumber(phoneNumber);
        }
        user.setPhoneVerified(true);
        user.setVerificationLevel(calculateVerificationLevel(user));
        user.setTrustScore(calculateTrustScore(user));
        return UserProfileResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }
        if (newPassword.length() < 8) {
            throw new RuntimeException("Le nouveau mot de passe doit contenir au moins 8 caractères");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", username);
    }
}
