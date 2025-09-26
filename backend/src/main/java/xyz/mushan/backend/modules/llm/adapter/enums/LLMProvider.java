package xyz.mushan.backend.modules.llm.adapter.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author mushan
 */
@AllArgsConstructor
@Getter
public enum LLMProvider {
    OPENAI("OpenAIChatGPTAdapter"),
    DEEPSEEK("DeepSeekAdapter"),
    OLLAMA("OllamaAdapter"),
    MOCK("MockLLMAdapter");

    private final String beanName;

}