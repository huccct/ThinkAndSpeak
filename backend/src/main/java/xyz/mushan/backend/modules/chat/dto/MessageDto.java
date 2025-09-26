package xyz.mushan.backend.modules.chat.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record MessageDto(
        Long id,
        String sender,
        String content,
        String metadata,
        LocalDateTime createdAt) implements Serializable {
}
