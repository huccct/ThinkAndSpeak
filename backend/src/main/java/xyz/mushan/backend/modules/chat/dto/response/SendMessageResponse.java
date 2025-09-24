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
public class SendMessageResponse {
    @Schema(description = "回复内容")
    private String reply;

    @Schema(description = "助手消息ID")
    private Long assistantMessageId;
}
