package xyz.mushan.backend.modules.llm.adapter.impl;

import org.springframework.stereotype.Component;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * @author mushan
 */
@Component
public class MockLLMAdapter implements LLMAdapter {

    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Override
    public String generate(String prompt) {
        return "[MOCK LLM] 收到 prompt: " + prompt;
    }

    @Override
    public void generateStream(String prompt,
                               Consumer<String> onChunk,
                               Consumer<Throwable> onError,
                               Runnable onComplete) throws Exception {
        executor.submit(() -> {
            try {
                // 将 prompt 按句号拆分为片段（示例）
                String[] parts = (prompt == null ? "":prompt).split("(?<=。)|(?<=\\.)|(?<=[?!])");
                for (String p : parts) {
                    if (p == null || p.isBlank()) {
                        continue;
                    }
                    Thread.sleep(300); // 模拟延迟
                    onChunk.accept(p.trim());
                }
                // 发送一个结尾提示
                onChunk.accept("[完]");
                if (onComplete != null) {
                    onComplete.run();
                }
            } catch (Throwable t) {
                if (onError != null) {
                    onError.accept(t);
                }
            }
        });
    }
}
