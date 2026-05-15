package com.coopconnect.repository;

import com.coopconnect.domain.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findByAdminId(UUID adminId);

    Page<Organization> findByOrgType(Organization.OrgType type, Pageable pageable);

    Page<Organization> findBySector(Organization.Sector sector, Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.status = 'ACTIVE' AND o.isActive = true")
    Page<Organization> findAllActive(Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.status = 'ACTIVE' AND o.isActive = true " +
           "AND (LOWER(o.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(o.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Organization> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.status = 'ACTIVE' AND o.isActive = true AND o.region = :region")
    Page<Organization> findByRegion(@Param("region") String region, Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.status = 'ACTIVE' AND o.isActive = true " +
           "AND o.orgType = :type AND o.sector = :sector")
    Page<Organization> findByTypeAndSector(@Param("type") Organization.OrgType type,
                                            @Param("sector") Organization.Sector sector, Pageable pageable);
}
