package xyz.mushan.backend.modules.chat.dto;

public record CharacterDto(
        Long id,
        String name,
        String tags,
        String persona,
        String portraitUrl) {
}
