package xyz.mushan.backend.modules.system.ws.handler;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import xyz.mushan.backend.modules.system.ws.service.AudioProcessingService;

import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author mushan
 */
@RequiredArgsConstructor
@Component
public class AudioWebSocketHandler extends BinaryWebSocketHandler {

    private final AudioProcessingService audioProcessingService;
    
    // 存储会话相关的元数据
    private final Map<String, SessionMetadata> sessionMetadata = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 初始化会话元数据
        sessionMetadata.put(session.getId(), new SessionMetadata());
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        ByteBuffer buffer = message.getPayload();
        byte[] data = new byte[buffer.remaining()];
        buffer.get(data);

        // 处理接收到的音频片段（ASR / 转发 / 存储）
        // onTranscript: 当识别到文本片段时，把文本通过 session 发送给前端（JSON）
        // onTtsAudio: 当生成 TTS 音频片段时，把二进制直接发送给前端（BinaryMessage）
        audioProcessingService.onAudioChunk(session, data,
                transcript -> {
                    try {
                        // 将识别文本发回前端（文本事件）
                        session.sendMessage(new TextMessage("{\"type\":\"transcript\",\"text\":\"" + escapeJson(transcript) + "\"}"));
                    } catch (Exception ignored) {}
                },
                ttsBytes -> {
                    try {
                        session.sendMessage(new BinaryMessage(ttsBytes));
                    } catch (Exception ignored) {}
                });
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        // 可接收控制消息（例如 start/end, sampleRate 等元信息）
        // message.getPayload() -> JSON 控制命令
        try {
            String payload = message.getPayload();
            // 解析控制消息，这里假设是简单的JSON格式
            if (payload.contains("start")) {
                SessionMetadata metadata = sessionMetadata.get(session.getId());
                if (metadata != null) {
                    metadata.setActive(true);
                }
            } else if (payload.contains("end")) {
                SessionMetadata metadata = sessionMetadata.get(session.getId());
                if (metadata != null) {
                    metadata.setActive(false);
                }
            } else if (payload.contains("sampleRate")) {
                // 可以解析sampleRate等参数
                SessionMetadata metadata = sessionMetadata.get(session.getId());
                if (metadata != null) {
                    // 示例：设置采样率
                    // metadata.setSampleRate(parsedSampleRate);
                }
            }
        } catch (Exception e) {
            // 忽略解析错误
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        // 清理会话
        audioProcessingService.onSessionClosed(session);
        sessionMetadata.remove(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // 处理传输错误
        super.handleTransportError(session, exception);
        sessionMetadata.remove(session.getId());
    }

    private String escapeJson(String s) {
        return s.replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
    
    /**
     * 会话元数据类
     */
    @Setter
    @Getter
    private static class SessionMetadata {
        private boolean active = false;
        private int sampleRate = 16000; // 默认采样率

    }
}