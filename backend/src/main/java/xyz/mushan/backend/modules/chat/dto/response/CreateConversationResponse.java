package xyz.mushan.backend.modules.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * @author mushan
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    // 会话ID
    private String conversationId;
}
