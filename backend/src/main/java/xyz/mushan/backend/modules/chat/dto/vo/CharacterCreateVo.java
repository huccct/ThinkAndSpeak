package xyz.mushan.backend.modules.chat.dto.vo;

import java.io.Serializable;

public record CharacterCreateVo(
        String name,
        String tags,
        String persona,
        String portraitUrl,
        String defaultVoice
) implements Serializable {
}
