package xyz.mushan.backend.modules.system.ws.service;

import org.springframework.web.socket.WebSocketSession;

import java.util.function.Consumer;

public interface AudioProcessingService {
    /**
     * 收到一段来自客户端的音频数据
     *
     * @param session       用户的 WebSocketSession，便于后续回推
     * @param audioChunk    音频二进制（例如 opus 或 PCM 数据）
     * @param onTranscript  当 ASR 识别出文本时回调（可以多次回调，部分识别）
     * @param onTtsAudio    当生成 TTS 音频片段时回调（可能多次，边合成边发）
     */
    void onAudioChunk(WebSocketSession session,
                      byte[] audioChunk,
                      Consumer<String> onTranscript,
                      Consumer<byte[]> onTtsAudio);

    void onSessionClosed(WebSocketSession session);
}