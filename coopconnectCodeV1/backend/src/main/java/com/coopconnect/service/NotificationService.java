package com.coopconnect.service;

import com.coopconnect.domain.model.Notification;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.NotificationResponse;
import com.coopconnect.repository.NotificationRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notify(User user, Notification.NotificationType type, String title, String message, String targetUrl) {
        if (user == null) return;
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .targetUrl(targetUrl)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(String username, int page, int size) {
        return notificationRepository
                .findByUserUsernameOrderByCreatedAtDesc(username, PageRequest.of(page, size))
                .map(NotificationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public long countUnread(String username) {
        return notificationRepository.countUnread(username);
    }

    @Transactional
    public void markRead(String username, UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        if (!notification.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Accès refusé");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        notificationRepository
                .findByUserUsernameOrderByCreatedAtDesc(user.getUsername(), PageRequest.of(0, 200))
                .forEach(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }
}
