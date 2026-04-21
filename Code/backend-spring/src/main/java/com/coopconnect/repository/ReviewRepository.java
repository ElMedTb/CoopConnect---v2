package com.coopconnect.repository;

import com.coopconnect.domain.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("SELECT r FROM Review r WHERE r.reviewedUser.id = :userId AND r.isPublic = true")
    Page<Review> findByReviewedUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.reviewer.id = :userId")
    Page<Review> findByReviewerId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.exchange.id = :exchangeId")
    Page<Review> findByExchangeId(@Param("exchangeId") UUID exchangeId, Pageable pageable);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.reviewedUser.id = :userId")
    Double getAverageRatingForUser(@Param("userId") UUID userId);
}
