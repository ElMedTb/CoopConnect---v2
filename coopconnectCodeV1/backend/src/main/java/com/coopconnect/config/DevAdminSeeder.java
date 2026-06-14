package com.coopconnect.config;

import com.coopconnect.domain.model.User;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.create-enabled:true}")
    private boolean createEnabled;

    @Value("${app.admin.username:admin}")
    private String username;

    @Value("${app.admin.email:admin@coopconnect.local}")
    private String email;

    @Value("${app.admin.password:Admin1234!}")
    private String password;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!createEnabled) {
            return;
        }

        relaxH2UserCheckConstraints();

        User admin = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(User::new);

        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFirstName("Admin");
        admin.setLastName("CoopConnect");
        admin.setUserType(User.UserType.ADMIN);
        admin.setStatus(User.UserStatus.ACTIVE);
        admin.setEmailVerified(true);
        admin.setPhoneVerified(true);
        admin.setLoginAttempts(0);
        admin.setRatingAverage(5.0);
        admin.setRatingCount(0);
        admin.setTrustScore(5.0);
        admin.setVerificationLevel(5);
        admin.setOnboardingCompleted(true);
        admin.setCredibilityVerified(true);
        admin.setSubscriptionPlan(User.SubscriptionPlan.PREMIUM);
        admin.setMatchingMonthlyQuota(3);
        admin.setMatchingUsageCount(0);
        admin.setIsActive(true);

        userRepository.save(admin);
        log.info("Dev admin account ready in core-service: {}", username);
    }

    private void relaxH2UserCheckConstraints() {
        try {
            List<String> constraints = jdbcTemplate.queryForList("""
                    SELECT tc.CONSTRAINT_NAME
                    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                    WHERE tc.TABLE_NAME = 'USERS'
                      AND tc.CONSTRAINT_TYPE = 'CHECK'
                    """, String.class);

            for (String constraint : constraints) {
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS " + constraint);
            }
        } catch (Exception e) {
            log.debug("Could not relax H2 user check constraints: {}", e.getMessage());
        }
    }
}
