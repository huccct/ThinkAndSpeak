package xyz.mushan.backend.modules.chat.dto;

import java.io.Serializable;

public record CharacterDto (
        Long id,
        String name,
        String tags,
        String persona,
        String portraitUrl) implements Serializable {
}
