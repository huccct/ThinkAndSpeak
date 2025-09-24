package xyz.mushan.backend.modules.chat.dto.response;

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
    // 会话ID
    private String conversationId;
}
