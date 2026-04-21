package com.coopconnect.controller;

import com.coopconnect.domain.model.Resource;
import com.coopconnect.dto.CreateResourceRequest;
import com.coopconnect.dto.ResourceResponse;
import com.coopconnect.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Surplus/Needs management")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Browse all available resources")
    public ResponseEntity<Page<ResourceResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(resourceService.getAllAvailable(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID")
    public ResponseEntity<ResourceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Filter by type (SURPLUS / NEED / PRODUCTION)")
    public ResponseEntity<Page<ResourceResponse>> getByType(
            @PathVariable Resource.ResourceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(resourceService.getByType(type, PageRequest.of(page, size)));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Filter by category")
    public ResponseEntity<Page<ResourceResponse>> getByCategory(
            @PathVariable Resource.ResourceCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(resourceService.getByCategory(category, PageRequest.of(page, size)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search resources by keyword")
    public ResponseEntity<Page<ResourceResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(resourceService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/org/{orgId}")
    @Operation(summary = "Get resources by organization")
    public ResponseEntity<Page<ResourceResponse>> getByOrg(
            @PathVariable UUID orgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(resourceService.getByOrganization(orgId, PageRequest.of(page, size)));
    }

    @PostMapping
    @Operation(summary = "Create a new resource (surplus or need)")
    public ResponseEntity<ResourceResponse> create(
            @Valid @RequestBody CreateResourceRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Withdraw a resource")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        resourceService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
