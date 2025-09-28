package xyz.mushan.backend.modules.chat.dto.request;

import lombok.Data;

/**
 * @author mushan
 */
@Data
public class SendMessageRequest {
    // 消息文本
    private String text;
}
