package com.coopconnect.repository;

import com.coopconnect.domain.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("SELECT r FROM Resource r WHERE r.status = 'AVAILABLE' AND r.isActive = true")
    Page<Resource> findAllAvailable(Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.organization.id = :orgId AND r.isActive = true")
    Page<Resource> findByOrganizationId(@Param("orgId") UUID orgId, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.resourceType = :type AND r.status = 'AVAILABLE' AND r.isActive = true")
    Page<Resource> findByType(@Param("type") Resource.ResourceType type, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.category = :cat AND r.status = 'AVAILABLE' AND r.isActive = true")
    Page<Resource> findByCategory(@Param("cat") Resource.ResourceCategory category, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.status = 'AVAILABLE' AND r.isActive = true " +
           "AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Resource> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.resourceType = :type AND r.category = :cat AND r.status = 'AVAILABLE' AND r.isActive = true")
    Page<Resource> findByTypeAndCategory(@Param("type") Resource.ResourceType type,
                                          @Param("cat") Resource.ResourceCategory cat, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Resource r WHERE r.organization.id = :orgId AND r.status = 'AVAILABLE'")
    long countAvailableByOrg(@Param("orgId") UUID orgId);
}
