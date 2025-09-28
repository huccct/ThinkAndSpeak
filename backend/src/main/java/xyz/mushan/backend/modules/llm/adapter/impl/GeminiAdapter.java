package xyz.mushan.backend.modules.llm.adapter.impl;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

import java.util.function.Consumer;

/**
 * Google Gemini Adapter
 * @author mushan
 */
@Component("geminiAdapter")
public class GeminiAdapter implements LLMAdapter {

    Client client;

    @Autowired
    public GeminiAdapter(
            @Value("${llm.gemini.api-key}") String apiKey) {
        client = Client.builder().apiKey(apiKey).build();
    }

    @Override
    public String generate(String prompt) {
        try {
            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null);

            if (response == null || response.text() == null) {
                return "[Gemini] 空响应";
            }
            return response.text();
        } catch (Exception e) {
            return "[Gemini] 调用失败: " + e.getMessage();
        }
    }

    @Override
    public void generateStream(String prompt, Consumer<String> onChunk, Consumer<Throwable> onError, Runnable onComplete) throws Exception {

    }
}