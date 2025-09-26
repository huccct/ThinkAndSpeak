package xyz.mushan.backend.modules.chat.dto.vo;

public record CharacterCreateVo(
        String name,
        String tags,
        String persona,
        String portraitUrl,
        String defaultVoice
){
}
