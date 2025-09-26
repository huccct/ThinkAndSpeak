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
public class SendMessageResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String reply;

    private Long assistantMessageId;
}
