package xyz.mushan.backend.modules.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;
import xyz.mushan.backend.modules.llm.adapter.enums.LLMProvider;

import java.util.Map;
import java.util.function.Consumer;

/**
 * 聊天服务类
 * 提供生成回复的功能，支持LLM适配器和本地模拟两种模式
 *
 * @author mushan
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    /**
     * LLM适配器，用于调用大语言模型生成回复
     * 使用Optional包装以支持不存在适配器时的本地模拟模式
     */
    private final Map<String, LLMAdapter> adapters;

    /**
     * 生成回复内容
     * 首先尝试使用LLM适配器生成回复，如果失败或适配器不存在则使用本地模拟
     *
     * @param persona     角色设定
     * @param history     对话历史
     * @param userMessage 用户消息
     * @return 生成的回复内容
     */
    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000)
    )
    public String generateReply(String persona, String history, String userMessage, LLMProvider provider) {
        LLMAdapter adapter = adapters.get(provider.getBeanName());
        if (adapter == null) {
            throw new IllegalArgumentException("未知的 LLM provider: " + provider);
        }
        // 构建提示词
        String prompt = String.format("""
                        %s
                        History:
                        %s
                        User: %s
                        Assistant:
                        """,
                persona == null ? "" : persona,
                history == null ? "" : history,
                userMessage
        );

        // 尝试使用LLM适配器生成回复
        try {
            return adapter.generate(prompt);
        } catch (Exception e) {
            // 当LLM调用失败时，降级到本地模拟模式
            log.error("LLM调用失败，降级到本地模拟模式", e);
        }

        // 本地模拟回复
        return String.format("""
                        【模拟回复】%s：
                        我看到了你的话 — "%s"（本地模拟）
                        """,
                persona == null ? "" : persona,
                userMessage
        );
    }

    /**
     * 生成流式回复内容
     * 通过SSE方式实时返回LLM生成的结果
     *
     * @param persona     角色设定
     * @param history     对话历史
     * @param userMessage 用户消息
     * @param provider    LLM提供商
     * @param onChunk     每次生成文本片段的回调
     * @param onError     错误回调
     * @param onComplete  完成回调
     */
    @Retryable(
            retryFor = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000)
    )
    public void generateReplyStream(String persona, String history, String userMessage,
                                    LLMProvider provider,
                                    Consumer<String> onChunk,
                                    Consumer<Throwable> onError,
                                    Runnable onComplete) {
        LLMAdapter adapter = adapters.get(provider.getBeanName());
        if (adapter == null) {
            throw new IllegalArgumentException("未知的 LLM provider: " + provider);
        }

        // 构建提示词
        String prompt = String.format("""
                    %s
                    History:
                    %s
                    User: %s
                    Assistant:
                    """,
                persona == null ? "" : persona,
                history == null ? "" : history,
                userMessage
        );

        // 尝试使用LLM适配器生成流式回复
        try {
            adapter.generateStream(prompt, onChunk, onError, onComplete);
        } catch (Exception e) {
            // 当LLM调用失败时，调用错误回调
            log.error("LLM流式调用失败", e);
            if (onError != null) {
                onError.accept(e);
            }
        }
    }

}
