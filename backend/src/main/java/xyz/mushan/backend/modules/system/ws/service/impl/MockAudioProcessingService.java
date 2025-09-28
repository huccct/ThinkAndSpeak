package xyz.mushan.backend.modules.system.ws.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import xyz.mushan.backend.modules.system.ws.service.AudioProcessingService;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * Mock 实现：把收到的音频 chunk 简单转成“识别文本”（示例），并回显音频（原样返回）
 * 真正生产环境应替换为调用 ASR（whisper/云厂商）和 TTS 服务。
 * @author mushan
 */
@Service
public class MockAudioProcessingService implements AudioProcessingService {

    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Override
    public void onAudioChunk(WebSocketSession session, byte[] audioChunk, Consumer<String> onTranscript, Consumer<byte[]> onTtsAudio) {
        // 模拟异步识别
        executor.submit(() -> {
            try {
                // 模拟识别：把 bytes 转成字符串（仅用于 demo）
                String fakeText = new String(audioChunk, StandardCharsets.UTF_8);
                if (fakeText.length() > 200) {
                    fakeText = fakeText.substring(0, 200);
                }
                String transcript = "[识别]" + fakeText;
                onTranscript.accept(transcript);

                // 模拟 TTS：把识别文本再回显为音频（这里只是把文本 bytes 返回，客户端可直接播放或展示）
                byte[] tts = transcript.getBytes(StandardCharsets.UTF_8);
                onTtsAudio.accept(tts);

            } catch (Throwable ignored) {}
        });
    }

    @Override
    public void onSessionClosed(WebSocketSession session) {
        // 可释放资源
    }
}