package com.coopconnect.auth.config;

import com.coopconnect.auth.domain.User;
import com.coopconnect.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random rnd = new Random(42);

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() >= 20) {
            log.info("Auth DB déjà seedée ({} users). Skip.", userRepository.count());
            return;
        }
        log.info("Auth Service — seeding 20 utilisateurs...");
        String hash = passwordEncoder.encode("Test1234!");

        userRepository.saveAll(List.of(
            mk("ahmed.benali",    "ahmed.benali@example.ma",    hash, "Ahmed",    "Benali",     "+212661234001", User.UserType.INDIVIDUAL,   "Casablanca", "Maroc", 33.5898, -7.6031, 4.6),
            mk("fatima.alaoui",   "fatima.alaoui@example.ma",   hash, "Fatima",   "Alaoui",     "+212661234002", User.UserType.PROFESSIONAL, "Rabat",      "Maroc", 34.0209, -6.8416, 4.8),
            mk("hassan.boukhris", "hassan.boukhris@example.ma", hash, "Hassan",   "Boukhris",   "+212661234003", User.UserType.BUSINESS,     "Marrakech",  "Maroc", 31.6295, -7.9811, 4.3),
            mk("aicha.bensouda",  "aicha.bensouda@example.ma",  hash, "Aicha",    "Bensouda",   "+212661234004", User.UserType.INDIVIDUAL,   "Fes",        "Maroc", 34.0181, -5.0078, 3.9),
            mk("mohamed.tahir",   "mohamed.tahir@example.ma",   hash, "Mohamed",  "Tahir",      "+212661234005", User.UserType.BUSINESS,     "Tanger",     "Maroc", 35.7595, -5.8340, 4.1),
            mk("khadija.ennajah", "khadija.ennajah@example.ma", hash, "Khadija",  "Ennajah",    "+212661234006", User.UserType.NON_PROFIT,   "Agadir",     "Maroc", 30.4278, -9.5981, 4.7),
            mk("youssef.amrani",  "youssef.amrani@example.ma",  hash, "Youssef",  "Amrani",     "+212661234007", User.UserType.PROFESSIONAL, "Casablanca", "Maroc", 33.5600, -7.6700, 4.5),
            mk("nadia.berrada",   "nadia.berrada@example.ma",   hash, "Nadia",    "Berrada",    "+212661234008", User.UserType.INDIVIDUAL,   "Rabat",      "Maroc", 34.0209, -6.8500, 3.7),
            mk("omar.filali",     "omar.filali@example.ma",     hash, "Omar",     "Filali",     "+212661234009", User.UserType.BUSINESS,     "Meknes",     "Maroc", 33.8935, -5.5547, 4.2),
            mk("salma.tazi",      "salma.tazi@example.ma",      hash, "Salma",    "Tazi",       "+212661234010", User.UserType.NON_PROFIT,   "Casablanca", "Maroc", 33.5850, -7.6200, 4.9),
            mk("karim.benj",      "karim.benjelloun@example.ma",hash, "Karim",    "Benjelloun", "+212661234011", User.UserType.PROFESSIONAL, "Casablanca", "Maroc", 33.5731, -7.5898, 4.4),
            mk("zineb.chraibi",   "zineb.chraibi@example.ma",   hash, "Zineb",    "Chraibi",    "+212661234012", User.UserType.INDIVIDUAL,   "Marrakech",  "Maroc", 31.6340, -7.9890, 3.8),
            mk("abdellah.mouss",  "abdellah.mouss@example.ma",  hash, "Abdellah", "Moussaoui",  "+212661234013", User.UserType.BUSINESS,     "Fes",        "Maroc", 34.0300, -5.0200, 4.0),
            mk("samira.kettani",  "samira.kettani@example.ma",  hash, "Samira",   "Kettani",    "+212661234014", User.UserType.INDIVIDUAL,   "Casablanca", "Maroc", 33.5400, -7.6400, 4.3),
            mk("rachid.idrissi",  "rachid.idrissi@example.ma",  hash, "Rachid",   "Idrissi",    "+212661234015", User.UserType.PROFESSIONAL, "Oujda",      "Maroc", 34.6805, -1.9076, 3.6),
            mk("houda.mansouri",  "houda.mansouri@example.ma",  hash, "Houda",    "Mansouri",   "+212661234016", User.UserType.INDIVIDUAL,   "Kenitra",    "Maroc", 34.2610, -6.5802, 4.1),
            mk("khalid.bouq",     "khalid.bouqroun@example.ma", hash, "Khalid",   "Bouqroun",   "+212661234017", User.UserType.BUSINESS,     "Agadir",     "Maroc", 30.3597, -9.5332, 4.6),
            mk("meriem.lahbabi",  "meriem.lahbabi@example.ma",  hash, "Meriem",   "Lahbabi",    "+212661234018", User.UserType.PROFESSIONAL, "Rabat",      "Maroc", 34.0100, -6.8200, 4.8),
            mk("mustapha.sekkat", "mustapha.sekkat@example.ma", hash, "Mustapha", "Sekkat",     "+212661234019", User.UserType.BUSINESS,     "Casablanca", "Maroc", 33.5300, -7.6600, 3.9),
            mk("rim.benkirane",   "rim.benkirane@example.ma",   hash, "Rim",      "Benkirane",  "+212661234020", User.UserType.INDIVIDUAL,   "Tanger",     "Maroc", 35.7700, -5.8100, 4.5)
        ));
        log.info("Auth Service — 20 utilisateurs créés.");
    }

    private User mk(String username, String email, String hash, String firstName, String lastName,
                    String phone, User.UserType type, String city, String country,
                    double lat, double lon, double trust) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(hash);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setPhoneNumber(phone);
        u.setUserType(type);
        u.setStatus(User.UserStatus.ACTIVE);
        u.setEmailVerified(true);
        u.setPhoneVerified(true);
        u.setLoginAttempts(0);
        u.setCity(city);
        u.setCountry(country);
        u.setLatitude(lat);
        u.setLongitude(lon);
        u.setTrustScore(trust);
        u.setRatingAverage(trust);
        u.setRatingCount(rnd.nextInt(40) + 5);
        u.setVerificationLevel(2);
        u.setMaxDistanceKm(80);
        u.setIsActive(true);
        u.setIsFeatured(false);
        u.setIsNegotiable(false);
        u.setCreatedAt(LocalDateTime.now().minusDays(rnd.nextInt(300) + 30));
        u.setUpdatedAt(LocalDateTime.now().minusDays(rnd.nextInt(10)));
        return u;
    }
}
