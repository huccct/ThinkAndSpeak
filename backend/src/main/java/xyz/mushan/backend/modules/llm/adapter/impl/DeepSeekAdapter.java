package xyz.mushan.backend.modules.llm.adapter.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

/**
 * DeepSeek 适配器
 * @author mushan
 */
@Component
public class DeepSeekAdapter implements LLMAdapter {

    @Value("${llm.deepseek.api-key}")
    private String apiKey;

    @Value("${llm.deepseek.model:deepseek-chat}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generate(String prompt) {
        String url = "https://api.deepseek.com/v1/chat/completions";

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", new Object[]{
                Map.of("role", "user", "content", prompt)
        });

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getBody() != null) {
            var choices = (Iterable<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null) {
                Map<String, Object> firstChoice = choices.iterator().next();
                Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                return message.get("content");
            }
        }
        return "[DeepSeek] 无返回内容";
    }

    @Override
    public void generateStream(String prompt, Consumer<String> onChunk, Consumer<Throwable> onError, Runnable onComplete) throws Exception {

    }
}