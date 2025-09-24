package xyz.mushan.backend.modules.chat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

import java.util.Optional;

/**
 * 聊天服务类
 * 提供生成回复的功能，支持LLM适配器和本地模拟两种模式
 *
 * @author mushan
 */
@Service
@RequiredArgsConstructor
public class ChatService {

    /**
     * LLM适配器，用于调用大语言模型生成回复
     * 使用Optional包装以支持不存在适配器时的本地模拟模式
     */
    private final Optional<LLMAdapter> llmAdapter;

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
    public String generateReply(String persona, String history, String userMessage) {
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
        if (llmAdapter.isPresent()) {
            try {
                return llmAdapter.get().generate(prompt);
            } catch (Exception e) {
                // 当LLM调用失败时，降级到本地模拟模式
            }
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
}
