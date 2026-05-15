package com.coopconnect.service;

import com.coopconnect.domain.model.Exchange;
import com.coopconnect.domain.model.ExchangeMessage;
import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.User;
import com.coopconnect.dto.ExchangeRequest;
import com.coopconnect.dto.ExchangeResponse;
import com.coopconnect.dto.MessageResponse;
import com.coopconnect.repository.ExchangeMessageRepository;
import com.coopconnect.repository.ExchangeRepository;
import com.coopconnect.repository.ListingRepository;
import com.coopconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeService {

    private final ExchangeRepository exchangeRepository;
    private final ExchangeMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public ExchangeResponse createExchange(String requesterUsername, ExchangeRequest req) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        UUID listingId = UUID.fromString(req.getListingId());
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable"));

        if (listing.getOwner().getUsername().equals(requesterUsername)) {
            throw new RuntimeException("Vous ne pouvez pas demander un échange sur votre propre annonce");
        }

        if (listing.getStatus() == Listing.ListingStatus.EXCHANGED) {
            throw new RuntimeException("Cette annonce a déjà été échangée");
        }

        Exchange exchange = Exchange.builder()
                .requester(requester)
                .provider(listing.getOwner())
                .listing(listing)
                .status(Exchange.ExchangeStatus.REQUESTED)
                .requestMessage(req.getMessage())
                .exchangeType("BARTER")
                .isPickupRequired(false)
                .isDeliveryRequired(false)
                .depositPaid(false)
                .depositRefunded(false)
                .agreementAcceptedByRequester(false)
                .agreementAcceptedByProvider(false)
                .completionConfirmedByRequester(false)
                .completionConfirmedByProvider(false)
                .cancellationPenalty(0.0)
                .disputeRaised(false)
                .disputeResolved(false)
                .build();

        Exchange saved = exchangeRepository.save(exchange);
        log.info("Exchange created: {} → listing {}", requesterUsername, listingId);
        return ExchangeResponse.fromEntity(saved);
    }

    @Transactional
    public ExchangeResponse accept(String username, UUID exchangeId, String responseMessage) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        if (!exchange.getProvider().getUsername().equals(username)) {
            throw new RuntimeException("Seul le propriétaire de l'annonce peut accepter");
        }
        if (exchange.getStatus() != Exchange.ExchangeStatus.REQUESTED) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        exchange.setStatus(Exchange.ExchangeStatus.ACCEPTED);
        exchange.setResponseMessage(responseMessage);

        Listing listing = exchange.getListing();
        listing.setStatus(Listing.ListingStatus.EXCHANGED);
        listingRepository.save(listing);

        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeResponse reject(String username, UUID exchangeId, String responseMessage) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        if (!exchange.getProvider().getUsername().equals(username)) {
            throw new RuntimeException("Seul le propriétaire de l'annonce peut rejeter");
        }
        if (exchange.getStatus() != Exchange.ExchangeStatus.REQUESTED) {
            throw new RuntimeException("Cette demande ne peut plus être modifiée");
        }

        exchange.setStatus(Exchange.ExchangeStatus.REJECTED);
        exchange.setResponseMessage(responseMessage);
        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeResponse cancel(String username, UUID exchangeId) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        boolean isParticipant = exchange.getRequester().getUsername().equals(username)
                || exchange.getProvider().getUsername().equals(username);
        if (!isParticipant) {
            throw new RuntimeException("Accès refusé");
        }
        if (exchange.getStatus() == Exchange.ExchangeStatus.COMPLETED) {
            throw new RuntimeException("Un échange complété ne peut pas être annulé");
        }

        exchange.setStatus(Exchange.ExchangeStatus.CANCELLED);
        exchange.setCancellationInitiatedBy(username);
        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    @Transactional(readOnly = true)
    public List<ExchangeResponse> getMyExchanges(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Page<Exchange> page = exchangeRepository.findByUserId(
                user.getId(),
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return page.getContent().stream()
                .map(ExchangeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExchangeResponse getExchange(String username, UUID exchangeId) {
        return ExchangeResponse.fromEntity(getExchangeForUser(username, exchangeId));
    }

    @Transactional
    public MessageResponse sendMessage(String senderUsername, UUID exchangeId, String content) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Exchange exchange = getExchangeForUser(senderUsername, exchangeId);
        boolean isParticipant = exchange.getRequester().getUsername().equals(senderUsername)
                || exchange.getProvider().getUsername().equals(senderUsername);
        if (!isParticipant) {
            throw new RuntimeException("Accès refusé");
        }

        ExchangeMessage message = ExchangeMessage.builder()
                .exchange(exchange)
                .sender(sender)
                .content(content)
                .messageType(ExchangeMessage.MessageType.TEXT)
                .isRead(false)
                .build();

        return MessageResponse.fromEntity(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String username, UUID exchangeId) {
        getExchangeForUser(username, exchangeId);
        return messageRepository.findByExchangeIdOrderByCreatedAtAsc(exchangeId)
                .stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private Exchange getExchangeForUser(String username, UUID exchangeId) {
        Exchange exchange = exchangeRepository.findById(exchangeId)
                .orElseThrow(() -> new RuntimeException("Échange introuvable"));

        boolean isParticipant = exchange.getRequester().getUsername().equals(username)
                || exchange.getProvider().getUsername().equals(username);
        if (!isParticipant) {
            throw new RuntimeException("Accès refusé");
        }
        return exchange;
    }
}
