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
