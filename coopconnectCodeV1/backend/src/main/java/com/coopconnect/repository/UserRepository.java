package com.coopconnect.repository;

import com.coopconnect.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for User entity.
 * Provides database operations for user management.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveUserByEmail(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.isActive = true")
    Optional<User> findActiveUserByUsername(@Param("username") String username);
    
    @Query("SELECT u FROM User u WHERE u.status = :status")
    Page<User> findByStatus(@Param("status") User.UserStatus status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.userType = :userType AND u.isActive = true")
    Page<User> findByUserTypeAndActive(@Param("userType") User.UserType userType, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND u.isActive = true")
    List<User> findUsersWithLocation();
    
    @Query("SELECT u FROM User u WHERE " +
           "(:radius IS NULL OR " +
           "(6371 * acos(cos(radians(u.latitude)) * cos(radians(:centerLat)) * " +
           "cos(radians(u.longitude) - radians(:centerLon)) + " +
           "sin(radians(u.latitude)) * sin(radians(:centerLat)) * " +
           "sin(radians(u.longitude) - radians(:centerLon)))) <= :radius * 1000) AND " +
           "u.isActive = true")
    List<User> findUsersWithinRadius(@Param("centerLat") Double centerLat, 
                                      @Param("centerLon") Double centerLon, 
                                      @Param("radius") Double radius);
    
    @Query("SELECT u FROM User u WHERE u.ratingAverage >= :minRating AND u.isActive = true")
    Page<User> findByMinimumRating(@Param("minRating") Double minRating, Pageable pageable);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);
}
