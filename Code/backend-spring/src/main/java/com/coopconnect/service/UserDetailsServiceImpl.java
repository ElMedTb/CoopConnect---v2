package com.coopconnect.service;

import com.coopconnect.domain.model.User;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Custom UserDetailsService implementation for Spring Security.
 * Loads user-specific data and converts to UserDetails.
 *
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        boolean isLocked = user.getAccountLockedUntil() != null &&
                user.getAccountLockedUntil().isAfter(LocalDateTime.now());

        if (Boolean.FALSE.equals(user.getIsActive()) || isLocked) {
            throw new UsernameNotFoundException("User account is locked or inactive");
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getUserType().name())))
                .accountExpired(false)
                .accountLocked(isLocked)
                .credentialsExpired(false)
                .disabled(Boolean.FALSE.equals(user.getIsActive()))
                .build();
    }
}
