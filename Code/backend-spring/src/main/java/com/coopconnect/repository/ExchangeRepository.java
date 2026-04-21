package com.coopconnect.repository;

import com.coopconnect.domain.model.Exchange;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExchangeRepository extends JpaRepository<Exchange, UUID> {

    @Query("SELECT e FROM Exchange e WHERE e.requester.id = :userId OR e.provider.id = :userId")
    Page<Exchange> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT e FROM Exchange e WHERE e.listing.id = :listingId")
    Page<Exchange> findByListingId(@Param("listingId") UUID listingId, Pageable pageable);

    Page<Exchange> findByStatus(Exchange.ExchangeStatus status, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Exchange e WHERE (e.requester.id = :userId OR e.provider.id = :userId) AND e.status = :status")
    long countByUserAndStatus(@Param("userId") UUID userId, @Param("status") Exchange.ExchangeStatus status);
}
