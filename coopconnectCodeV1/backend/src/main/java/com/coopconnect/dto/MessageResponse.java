package com.coopconnect.dto;

import com.coopconnect.domain.model.ExchangeMessage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private String id;
    private String content;
    private String senderId;
    private String senderName;
    private String senderUsername;
    private LocalDateTime sentAt;

    public static MessageResponse fromEntity(ExchangeMessage m) {
        String senderName = m.getSender().getFirstName() + " " + m.getSender().getLastName();
        return MessageResponse.builder()
                .id(m.getId().toString())
                .content(m.getContent())
                .senderId(m.getSender().getId().toString())
                .senderName(senderName)
                .senderUsername(m.getSender().getUsername())
                .sentAt(m.getCreatedAt())
                .build();
    }
}
