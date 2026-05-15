package com.coopconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendVerificationEmail(String to, String token) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("noreply@coopconnect.ai");
            msg.setTo(to);
            msg.setSubject("Vérifiez votre compte CoopConnect AI");
            msg.setText("Lien de vérification : http://localhost:5173/verify-email?token=" + token);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Email non envoyé à {} : {}", to, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("noreply@coopconnect.ai");
            msg.setTo(to);
            msg.setSubject("Réinitialisation de mot de passe — CoopConnect AI");
            msg.setText("Lien de réinitialisation : http://localhost:5173/reset-password?token=" + token);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Email non envoyé à {} : {}", to, e.getMessage());
        }
    }
}
