package xyz.mushan.backend.modules.llm.adapter.impl;

import org.springframework.stereotype.Component;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

/**
 * @author mushan
 */
@Component
public class MockLLMAdapter implements LLMAdapter {
    @Override
    public String generate(String prompt) {
        return "[MOCK LLM] 收到 prompt: " + prompt;
    }
}
