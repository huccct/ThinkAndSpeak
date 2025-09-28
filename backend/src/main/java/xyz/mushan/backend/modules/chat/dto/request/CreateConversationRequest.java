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
    private Long characterId;
}
