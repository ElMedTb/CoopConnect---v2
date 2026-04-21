package com.coopconnect.service;

import com.coopconnect.domain.model.Organization;
import com.coopconnect.domain.model.Resource;
import com.coopconnect.dto.CreateResourceRequest;
import com.coopconnect.dto.ResourceResponse;
import com.coopconnect.repository.OrganizationRepository;
import com.coopconnect.repository.ResourceRepository;
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
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ResourceResponse> getAllAvailable(Pageable pageable) {
        return resourceRepository.findAllAvailable(pageable).map(ResourceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(UUID id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));
        return ResourceResponse.fromEntity(r);
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponse> getByType(Resource.ResourceType type, Pageable pageable) {
        return resourceRepository.findByType(type, pageable).map(ResourceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponse> getByCategory(Resource.ResourceCategory category, Pageable pageable) {
        return resourceRepository.findByCategory(category, pageable).map(ResourceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponse> search(String query, Pageable pageable) {
        return resourceRepository.search(query, pageable).map(ResourceResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponse> getByOrganization(UUID orgId, Pageable pageable) {
        return resourceRepository.findByOrganizationId(orgId, pageable).map(ResourceResponse::fromEntity);
    }

    @Transactional
    public ResourceResponse create(CreateResourceRequest request, String username) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Organization org = organizationRepository.findByAdminId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vous devez d'abord créer une organisation"));

        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .estimatedValue(request.getEstimatedValue())
                .conditionState(request.getConditionState())
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .recurringFrequency(request.getRecurringFrequency())
                .locationText(request.getLocationText() != null ? request.getLocationText() : org.getCity())
                .deliveryAvailable(request.getDeliveryAvailable() != null ? request.getDeliveryAvailable() : false)
                .pickupOnly(request.getPickupOnly() != null ? request.getPickupOnly() : true)
                .maxDeliveryKm(request.getMaxDeliveryKm())
                .latitude(org.getLatitude())
                .longitude(org.getLongitude())
                .organization(org)
                .viewsCount(0)
                .contactCount(0)
                .status(Resource.ResourceStatus.AVAILABLE)
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Ressource créée : {} ({}) par {}", saved.getName(), saved.getResourceType(), org.getName());
        return ResourceResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(UUID id, String username) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!r.getOrganization().getAdmin().getId().equals(user.getId())) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres ressources");
        }
        r.setStatus(Resource.ResourceStatus.WITHDRAWN);
        r.setIsActive(false);
        resourceRepository.save(r);
    }
}
