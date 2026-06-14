package com.coopconnect.service;

import com.coopconnect.domain.model.Exchange;
import com.coopconnect.domain.model.ExchangeMessage;
import com.coopconnect.domain.model.Listing;
import com.coopconnect.domain.model.Notification;
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

import java.time.LocalDateTime;
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
    private final NotificationService notificationService;

    @Transactional
    public ExchangeResponse createExchange(String requesterUsername, ExchangeRequest req) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        UUID listingId = UUID.fromString(req.getListingId());
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Annonce introuvable"));

        if (listing.getOwner().getUsername().equals(requesterUsername)) {
            throw new RuntimeException("Vous ne pouvez pas demander un echange sur votre propre annonce");
        }
        if (listing.getStatus() == Listing.ListingStatus.EXCHANGED) {
            throw new RuntimeException("Cette annonce a deja ete echangee");
        }
        if (listing.getStatus() != Listing.ListingStatus.ACTIVE) {
            throw new RuntimeException("Cette annonce n'est pas disponible pour un echange");
        }

        Listing offeredListing = resolveOfferedListing(req.getOfferedListingId(), requesterUsername);

        Exchange exchange = Exchange.builder()
                .requester(requester)
                .provider(listing.getOwner())
                .listing(listing)
                .offeredListing(offeredListing)
                .status(Exchange.ExchangeStatus.REQUESTED)
                .requestMessage(req.getMessage())
                .requesterQrToken(UUID.randomUUID().toString())
                .providerQrToken(UUID.randomUUID().toString())
                .requesterQrConfirmed(false)
                .providerQrConfirmed(false)
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
        notificationService.notify(
                listing.getOwner(),
                Notification.NotificationType.EXCHANGE_REQUEST,
                "Nouvelle demande d'echange",
                requester.getFirstName() + " veut echanger avec votre annonce: " + listing.getTitle(),
                "/exchanges"
        );
        log.info("Exchange created: {} -> listing {}", requesterUsername, listingId);
        return ExchangeResponse.fromEntity(saved);
    }

    @Transactional
    public ExchangeResponse accept(String username, UUID exchangeId, String responseMessage) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        if (!exchange.getProvider().getUsername().equals(username)) {
            throw new RuntimeException("Seul le proprietaire de l'annonce peut accepter");
        }
        if (exchange.getStatus() != Exchange.ExchangeStatus.REQUESTED) {
            throw new RuntimeException("Cette demande ne peut plus etre modifiee");
        }

        exchange.setStatus(Exchange.ExchangeStatus.ACCEPTED);
        exchange.setResponseMessage(responseMessage);
        reserveListings(exchange);

        notificationService.notify(
                exchange.getRequester(),
                Notification.NotificationType.EXCHANGE_ACCEPTED,
                "Demande acceptee",
                "Votre demande pour " + exchange.getListing().getTitle() + " a ete acceptee. Validez l'echange avec les QR codes.",
                "/exchanges"
        );

        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeResponse reject(String username, UUID exchangeId, String responseMessage) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        if (!exchange.getProvider().getUsername().equals(username)) {
            throw new RuntimeException("Seul le proprietaire de l'annonce peut rejeter");
        }
        if (exchange.getStatus() != Exchange.ExchangeStatus.REQUESTED) {
            throw new RuntimeException("Cette demande ne peut plus etre modifiee");
        }

        exchange.setStatus(Exchange.ExchangeStatus.REJECTED);
        exchange.setResponseMessage(responseMessage);
        notificationService.notify(
                exchange.getRequester(),
                Notification.NotificationType.EXCHANGE_REJECTED,
                "Demande refusee",
                "Votre demande pour " + exchange.getListing().getTitle() + " a ete refusee.",
                "/exchanges"
        );
        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    @Transactional
    public ExchangeResponse cancel(String username, UUID exchangeId) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        boolean isParticipant = exchange.getRequester().getUsername().equals(username)
                || exchange.getProvider().getUsername().equals(username);
        if (!isParticipant) {
            throw new RuntimeException("Acces refuse");
        }
        if (exchange.getStatus() == Exchange.ExchangeStatus.COMPLETED) {
            throw new RuntimeException("Un echange complete ne peut pas etre annule");
        }

        exchange.setStatus(Exchange.ExchangeStatus.CANCELLED);
        exchange.setCancellationInitiatedBy(username);
        restoreReservedListings(exchange);

        User other = exchange.getRequester().getUsername().equals(username)
                ? exchange.getProvider()
                : exchange.getRequester();
        notificationService.notify(
                other,
                Notification.NotificationType.EXCHANGE_CANCELLED,
                "Echange annule",
                "L'echange autour de " + exchange.getListing().getTitle() + " a ete annule.",
                "/exchanges"
        );
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
            throw new RuntimeException("Acces refuse");
        }

        ExchangeMessage message = ExchangeMessage.builder()
                .exchange(exchange)
                .sender(sender)
                .content(content)
                .messageType(ExchangeMessage.MessageType.TEXT)
                .isRead(false)
                .build();

        MessageResponse response = MessageResponse.fromEntity(messageRepository.save(message));
        User receiver = exchange.getRequester().getUsername().equals(senderUsername)
                ? exchange.getProvider()
                : exchange.getRequester();
        notificationService.notify(
                receiver,
                Notification.NotificationType.MESSAGE,
                "Nouveau message",
                sender.getFirstName() + " a envoye un message dans un echange.",
                "/exchanges"
        );
        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String username, UUID exchangeId) {
        getExchangeForUser(username, exchangeId);
        return messageRepository.findByExchangeIdOrderByCreatedAtAsc(exchangeId)
                .stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExchangeResponse scanQr(String username, UUID exchangeId, String payload) {
        Exchange exchange = getExchangeForUser(username, exchangeId);
        if (exchange.getStatus() != Exchange.ExchangeStatus.ACCEPTED
                && exchange.getStatus() != Exchange.ExchangeStatus.IN_PROGRESS) {
            throw new RuntimeException("Le QR code est utilisable uniquement apres acceptation de l'echange");
        }
        if (payload == null || payload.isBlank()) {
            throw new RuntimeException("QR code manquant");
        }

        QrData qr = parseQr(payload.trim());
        if (!qr.exchangeId().equals(exchange.getId())) {
            throw new RuntimeException("Ce QR code ne correspond pas a cet echange");
        }

        boolean currentUserIsRequester = exchange.getRequester().getUsername().equals(username);
        LocalDateTime now = LocalDateTime.now();
        if (currentUserIsRequester) {
            validateProviderQr(exchange, qr);
            exchange.setRequesterQrConfirmed(true);
            exchange.setRequesterQrConfirmedAt(now);
        } else {
            validateRequesterQr(exchange, qr);
            exchange.setProviderQrConfirmed(true);
            exchange.setProviderQrConfirmedAt(now);
        }

        if (Boolean.TRUE.equals(exchange.getRequesterQrConfirmed())
                && Boolean.TRUE.equals(exchange.getProviderQrConfirmed())) {
            exchange.setStatus(Exchange.ExchangeStatus.COMPLETED);
            exchange.setCompletionConfirmedByRequester(true);
            exchange.setCompletionConfirmedByProvider(true);
            exchange.setCompletionConfirmedAt(now);
            markListingsExchanged(exchange);
            notifyCompleted(exchange);
        } else {
            exchange.setStatus(Exchange.ExchangeStatus.IN_PROGRESS);
        }

        return ExchangeResponse.fromEntity(exchangeRepository.save(exchange));
    }

    private Listing resolveOfferedListing(String offeredListingId, String requesterUsername) {
        if (offeredListingId == null || offeredListingId.isBlank()) {
            return null;
        }
        Listing offeredListing = listingRepository.findById(UUID.fromString(offeredListingId))
                .orElseThrow(() -> new RuntimeException("Annonce proposee introuvable"));
        if (!offeredListing.getOwner().getUsername().equals(requesterUsername)) {
            throw new RuntimeException("Vous ne pouvez proposer que vos propres annonces");
        }
        if (offeredListing.getStatus() != Listing.ListingStatus.ACTIVE) {
            throw new RuntimeException("L'annonce proposee n'est pas disponible");
        }
        return offeredListing;
    }

    private void validateProviderQr(Exchange exchange, QrData qr) {
        if (!"PROVIDER".equals(qr.side())
                || !qr.listingId().equals(exchange.getListing().getId())
                || !qr.token().equals(exchange.getProviderQrToken())) {
            throw new RuntimeException("QR code invalide pour l'annonce du proprietaire");
        }
    }

    private void validateRequesterQr(Exchange exchange, QrData qr) {
        UUID expectedListingId = exchange.getOfferedListing() != null
                ? exchange.getOfferedListing().getId()
                : exchange.getListing().getId();
        if (!"REQUESTER".equals(qr.side())
                || !qr.listingId().equals(expectedListingId)
                || !qr.token().equals(exchange.getRequesterQrToken())) {
            throw new RuntimeException("QR code invalide pour l'annonce du demandeur");
        }
    }

    private QrData parseQr(String payload) {
        String[] parts = payload.split(":");
        if (parts.length != 5 || !"CCQR".equals(parts[0])) {
            throw new RuntimeException("Format QR code invalide");
        }
        try {
            return new QrData(
                    UUID.fromString(parts[1]),
                    UUID.fromString(parts[2]),
                    parts[3],
                    parts[4]
            );
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Format QR code invalide");
        }
    }

    private void reserveListings(Exchange exchange) {
        exchange.getListing().setStatus(Listing.ListingStatus.SUSPENDED);
        listingRepository.save(exchange.getListing());
        if (exchange.getOfferedListing() != null) {
            exchange.getOfferedListing().setStatus(Listing.ListingStatus.SUSPENDED);
            listingRepository.save(exchange.getOfferedListing());
        }
    }

    private void markListingsExchanged(Exchange exchange) {
        exchange.getListing().setStatus(Listing.ListingStatus.EXCHANGED);
        listingRepository.save(exchange.getListing());
        if (exchange.getOfferedListing() != null) {
            exchange.getOfferedListing().setStatus(Listing.ListingStatus.EXCHANGED);
            listingRepository.save(exchange.getOfferedListing());
        }
    }

    private void restoreReservedListings(Exchange exchange) {
        if (exchange.getListing().getStatus() == Listing.ListingStatus.SUSPENDED) {
            exchange.getListing().setStatus(Listing.ListingStatus.ACTIVE);
            listingRepository.save(exchange.getListing());
        }
        if (exchange.getOfferedListing() != null
                && exchange.getOfferedListing().getStatus() == Listing.ListingStatus.SUSPENDED) {
            exchange.getOfferedListing().setStatus(Listing.ListingStatus.ACTIVE);
            listingRepository.save(exchange.getOfferedListing());
        }
    }

    private void notifyCompleted(Exchange exchange) {
        notificationService.notify(
                exchange.getRequester(),
                Notification.NotificationType.EXCHANGE_COMPLETED,
                "Echange termine",
                "L'echange pour " + exchange.getListing().getTitle() + " est confirme par QR code.",
                "/exchanges"
        );
        notificationService.notify(
                exchange.getProvider(),
                Notification.NotificationType.EXCHANGE_COMPLETED,
                "Echange termine",
                "L'echange pour " + exchange.getListing().getTitle() + " est confirme par QR code.",
                "/exchanges"
        );
    }

    private Exchange getExchangeForUser(String username, UUID exchangeId) {
        Exchange exchange = exchangeRepository.findById(exchangeId)
                .orElseThrow(() -> new RuntimeException("Echange introuvable"));

        boolean isParticipant = exchange.getRequester().getUsername().equals(username)
                || exchange.getProvider().getUsername().equals(username);
        if (!isParticipant) {
            throw new RuntimeException("Acces refuse");
        }
        return exchange;
    }

    private record QrData(UUID exchangeId, UUID listingId, String side, String token) {}
}
