package com.coopconnect.repository;

import com.coopconnect.domain.model.ExchangeMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExchangeMessageRepository extends JpaRepository<ExchangeMessage, UUID> {

    List<ExchangeMessage> findByExchangeIdOrderByCreatedAtAsc(UUID exchangeId);
}
