package com.coopconnect.controller;

import com.coopconnect.dto.ExchangeRequest;
import com.coopconnect.dto.ExchangeResponse;
import com.coopconnect.dto.MessageResponse;
import com.coopconnect.service.ExchangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exchanges")
@RequiredArgsConstructor
@Tag(name = "Exchanges", description = "Exchange request management")
public class ExchangeController {

    private final ExchangeService exchangeService;

    @PostMapping
    @Operation(summary = "Create an exchange request")
    public ResponseEntity<ExchangeResponse> create(
            Authentication auth,
            @RequestBody ExchangeRequest req) {
        return ResponseEntity.ok(exchangeService.createExchange(auth.getName(), req));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all exchanges for the current user")
    public ResponseEntity<List<ExchangeResponse>> getMyExchanges(Authentication auth) {
        return ResponseEntity.ok(exchangeService.getMyExchanges(auth.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific exchange")
    public ResponseEntity<ExchangeResponse> getExchange(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(exchangeService.getExchange(auth.getName(), id));
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Accept an exchange request")
    public ResponseEntity<ExchangeResponse> accept(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String msg = body != null ? body.get("message") : null;
        return ResponseEntity.ok(exchangeService.accept(auth.getName(), id, msg));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject an exchange request")
    public ResponseEntity<ExchangeResponse> reject(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String msg = body != null ? body.get("message") : null;
        return ResponseEntity.ok(exchangeService.reject(auth.getName(), id, msg));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an exchange")
    public ResponseEntity<ExchangeResponse> cancel(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(exchangeService.cancel(auth.getName(), id));
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Get messages for an exchange (chat)")
    public ResponseEntity<List<MessageResponse>> getMessages(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(exchangeService.getMessages(auth.getName(), id));
    }

    @PostMapping("/{id}/messages")
    @Operation(summary = "Send a message in an exchange")
    public ResponseEntity<MessageResponse> sendMessage(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                exchangeService.sendMessage(auth.getName(), id, body.get("content"))
        );
    }
}
