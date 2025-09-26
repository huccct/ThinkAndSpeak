package xyz.mushan.backend.modules.chat.dto;

import java.io.Serializable;
import java.util.List;

public record ConversationDto(
        Long id,
        Long characterId,
        List<MessageDto> messages) implements Serializable {
}
