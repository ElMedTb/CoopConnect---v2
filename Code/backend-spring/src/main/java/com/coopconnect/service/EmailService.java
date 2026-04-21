package com.coopconnect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for handling email operations.
 * Provides email verification and notification services.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String to, String token) {
        log.info("Sending verification email to: {}", to);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@coopconnect.ai");
            message.setTo(to);
            message.setSubject("Verify your CoopConnect AI account");
            
            String verificationUrl = "http://localhost:3000/verify-email?token=" + token;
            String emailContent = buildVerificationEmailContent(to, verificationUrl);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        log.info("Sending password reset email to: {}", to);
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@coopconnect.ai");
            message.setTo(to);
            message.setSubject("Reset your CoopConnect AI password");
            
            String resetUrl = "http://localhost:3000/reset-password?token=" + token;
            String emailContent = buildPasswordResetEmailContent(to, resetUrl);
            
            message.setText(emailContent);
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String buildVerificationEmailContent(String email, String verificationUrl) {
        return "Hello " + email + ",\n\n" +
               "Thank you for registering with CoopConnect AI!\n\n" +
               "Please click the link below to verify your email address:\n\n" +
               verificationUrl + "\n\n" +
               "This link will expire in 24 hours.\n\n" +
               "If you didn't create an account, please ignore this email.\n\n" +
               "Best regards,\n" +
               "The CoopConnect AI Team";
    }

    private String buildPasswordResetEmailContent(String email, String resetUrl) {
        return "Hello " + email + ",\n\n" +
               "You requested to reset your password for your CoopConnect AI account.\n\n" +
               "Please click the link below to reset your password:\n\n" +
               resetUrl + "\n\n" +
               "This link will expire in 1 hour.\n\n" +
               "If you didn't request this reset, please ignore this email.\n\n" +
               "Best regards,\n" +
               "The CoopConnect AI Team";
    }
}
