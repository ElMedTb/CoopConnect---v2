package com.coopconnect.repository;

import com.coopconnect.domain.model.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    Page<Listing> findByStatus(Listing.ListingStatus status, Pageable pageable);

    long countByStatus(Listing.ListingStatus status);

    long countByIsActiveTrue();

    @Query("SELECT l FROM Listing l WHERE l.owner.id = :ownerId AND l.isActive = true")
    Page<Listing> findByOwnerId(@Param("ownerId") UUID ownerId, Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND l.isActive = true")
    Page<Listing> findAllActive(Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE l.category = :category AND l.status = 'ACTIVE' AND l.isActive = true")
    Page<Listing> findByCategory(@Param("category") Listing.ListingCategory category, Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE l.type = :type AND l.status = 'ACTIVE' AND l.isActive = true")
    Page<Listing> findByType(@Param("type") Listing.ListingType type, Pageable pageable);

    @Query("SELECT l FROM Listing l WHERE LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Listing> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.owner.id = :ownerId AND l.status = 'ACTIVE'")
    long countActiveByOwner(@Param("ownerId") UUID ownerId);
}
