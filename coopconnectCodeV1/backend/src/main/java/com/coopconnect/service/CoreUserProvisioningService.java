package com.coopconnect.service;

import com.coopconnect.domain.model.User;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CoreUserProvisioningService {

    private final UserRepository userRepository;

    @Transactional
    public User getOrCreateByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> createMinimalUser(username));
    }

    private User createMinimalUser(String username) {
        log.info("Provisioning missing core user: {}", username);
        String safeEmail = username.contains("@")
                ? username
                : username + "@pending.coopconnect.local";
        User user = User.builder()
                .username(username)
                .email(safeEmail)
                .password("{noop}external-jwt-user")
                .firstName(username)
                .lastName("Utilisateur")
                .userType(User.UserType.INDIVIDUAL)
                .status(User.UserStatus.ACTIVE)
                .emailVerified(username.contains("@"))
                .phoneVerified(false)
                .loginAttempts(0)
                .ratingAverage(0.0)
                .ratingCount(0)
                .trustScore(0.0)
                .verificationLevel(username.contains("@") ? 1 : 0)
                .onboardingCompleted(false)
                .credibilityVerified(false)
                .subscriptionPlan(User.SubscriptionPlan.STANDARD)
                .matchingMonthlyQuota(3)
                .matchingUsageCount(0)
                .build();
        user.setIsActive(true);
        return userRepository.save(user);
    }
}
