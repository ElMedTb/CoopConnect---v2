package com.coopconnect.controller;

import com.coopconnect.domain.model.Organization;
import com.coopconnect.dto.OrganizationResponse;
import com.coopconnect.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Organization management")
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    @Operation(summary = "Browse all organizations")
    public ResponseEntity<Page<OrganizationResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(organizationService.getAllActive(PageRequest.of(page, size, Sort.by("name"))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get organization by ID")
    public ResponseEntity<OrganizationResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(organizationService.getById(id));
    }

    @GetMapping("/mine")
    @Operation(summary = "Get my organization")
    public ResponseEntity<OrganizationResponse> getMine(Authentication auth) {
        OrganizationResponse org = organizationService.getByAdmin(auth.getName());
        return org != null ? ResponseEntity.ok(org) : ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search organizations")
    public ResponseEntity<Page<OrganizationResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(organizationService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Filter by org type")
    public ResponseEntity<Page<OrganizationResponse>> getByType(
            @PathVariable Organization.OrgType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(organizationService.getByType(type, PageRequest.of(page, size)));
    }

    @GetMapping("/sector/{sector}")
    @Operation(summary = "Filter by sector")
    public ResponseEntity<Page<OrganizationResponse>> getBySector(
            @PathVariable Organization.Sector sector,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(organizationService.getBySector(sector, PageRequest.of(page, size)));
    }

    @PostMapping
    @Operation(summary = "Create organization")
    public ResponseEntity<OrganizationResponse> create(
            @RequestBody Organization org, Authentication auth) {
        return ResponseEntity.ok(organizationService.create(org, auth.getName()));
    }
}
