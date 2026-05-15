package com.coopconnect.repository;

import com.coopconnect.domain.model.Partnership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, UUID> {

    @Query("SELECT p FROM Partnership p WHERE p.initiator.id = :orgId OR p.partner.id = :orgId")
    Page<Partnership> findByOrganizationId(@Param("orgId") UUID orgId, Pageable pageable);

    @Query("SELECT p FROM Partnership p WHERE (p.initiator.id = :orgId OR p.partner.id = :orgId) AND p.status = :status")
    Page<Partnership> findByOrgAndStatus(@Param("orgId") UUID orgId, @Param("status") Partnership.PartnershipStatus status, Pageable pageable);

    Page<Partnership> findByStatus(Partnership.PartnershipStatus status, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Partnership p WHERE (p.initiator.id = :orgId OR p.partner.id = :orgId) AND p.status = 'ACTIVE'")
    long countActiveByOrg(@Param("orgId") UUID orgId);

    @Query("SELECT SUM(p.co2SavedKg) FROM Partnership p WHERE (p.initiator.id = :orgId OR p.partner.id = :orgId) AND p.status IN ('ACTIVE', 'COMPLETED')")
    Double totalCO2SavedByOrg(@Param("orgId") UUID orgId);
}
