package com.coopconnect.repository;

import com.coopconnect.domain.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUserUsernameOrderByCreatedAtDesc(String username, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.username = :username AND n.isRead = false")
    long countUnread(@Param("username") String username);
}
