package xyz.mushan.backend.modules.chat.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.time.LocalDateTime;

public record MessageDto (
        Long id,
        String sender,
        String content,
        String metadata,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime createdAt
) implements Serializable {
}
