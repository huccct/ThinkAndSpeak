package xyz.mushan.backend.modules.chat.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author mushan
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationResponse {
    @Schema(description = "会话ID")
    private String conversationId;
}
