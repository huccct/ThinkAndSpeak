package xyz.mushan.backend.modules.chat.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * @author mushan
 */
@Data
public class CreateConversationRequest {
    // 角色ID, Long字符串
    @NotBlank
    @Pattern(regexp = "\\d{1,19}", message = "characterId 必须为1-19位数字")
    private String characterId;

    // 用户ID, Long字符串
    private String userId;
}
