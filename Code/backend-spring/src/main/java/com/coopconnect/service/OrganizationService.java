package com.coopconnect.service;

import com.coopconnect.domain.model.Organization;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.OrganizationResponse;
import com.coopconnect.repository.OrganizationRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<OrganizationResponse> getAllActive(Pageable pageable) {
        return organizationRepository.findAllActive(pageable).map(OrganizationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getById(UUID id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organisation non trouvée"));
        return OrganizationResponse.fromEntity(org);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getByAdmin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Organization org = organizationRepository.findByAdminId(user.getId())
                .orElse(null);
        return org != null ? OrganizationResponse.fromEntity(org) : null;
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponse> search(String query, Pageable pageable) {
        return organizationRepository.search(query, pageable).map(OrganizationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponse> getByType(Organization.OrgType type, Pageable pageable) {
        return organizationRepository.findByOrgType(type, pageable).map(OrganizationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponse> getBySector(Organization.Sector sector, Pageable pageable) {
        return organizationRepository.findBySector(sector, pageable).map(OrganizationResponse::fromEntity);
    }

    @Transactional
    public OrganizationResponse create(Organization org, String username) {
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        org.setAdmin(admin);
        org.setStatus(Organization.OrgStatus.ACTIVE);
        Organization saved = organizationRepository.save(org);
        log.info("Organisation créée : {} par {}", saved.getName(), username);
        return OrganizationResponse.fromEntity(saved);
    }
}
