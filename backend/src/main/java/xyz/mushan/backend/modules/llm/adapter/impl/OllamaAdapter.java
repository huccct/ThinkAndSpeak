package xyz.mushan.backend.modules.llm.adapter.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import xyz.mushan.backend.modules.llm.adapter.LLMAdapter;

import java.util.HashMap;
import java.util.Map;

/**
 * Ollama 本地适配器
 * @author mushan
 */
@Component
public class OllamaAdapter implements LLMAdapter {

    @Value("${llm.ollama.model:llama3}")
    private String model;

    @Value("${llm.ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generate(String prompt) {
        String url = baseUrl + "/api/generate";

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("prompt", prompt);
        // 简化处理，不用流式
        body.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getBody() != null && response.getBody().get("response") != null) {
            return response.getBody().get("response").toString();
        }
        return "[Ollama] 无返回内容";
    }
}