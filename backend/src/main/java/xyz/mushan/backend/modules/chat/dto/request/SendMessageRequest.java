package xyz.mushan.backend.modules.chat.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * @author mushan
 */
@Data
public class SendMessageRequest {
    @Schema(description = "消息文本")
    private String text;

    @Schema(description = "角色设定，可选")
    private String persona;
}
