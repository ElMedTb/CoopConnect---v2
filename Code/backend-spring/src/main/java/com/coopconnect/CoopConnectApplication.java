package com.coopconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for CoopConnect AI Platform.
 * 
 * This class serves as the entry point for the Spring Boot application.
 * It enables various Spring Boot features including caching, async processing,
 * and scheduling capabilities.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableJpaAuditing
public class CoopConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoopConnectApplication.class, args);
    }
}
