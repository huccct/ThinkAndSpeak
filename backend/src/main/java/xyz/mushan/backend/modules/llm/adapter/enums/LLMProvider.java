package xyz.mushan.backend.modules.llm.adapter.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author mushan
 */
@AllArgsConstructor
@Getter
public enum LLMProvider {
    OPENAI("openAIChatGPTAdapter"),
    DEEPSEEK("deepSeekAdapter"),
    OLLAMA("ollamaAdapter"),
    MOCK("mockLLMAdapter");

    private final String beanName;

}