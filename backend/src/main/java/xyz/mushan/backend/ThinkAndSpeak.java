package xyz.mushan.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author mushan
 */
@SpringBootApplication
public class ThinkAndSpeak {

    private static final Logger log = LoggerFactory.getLogger(ThinkAndSpeak.class);

    @Value("${server.port:8080}")
    private int serverPort;

    @Value("${springdoc.swagger-ui.path:/swagger-ui.html}")
    private String swaggerPath;

    public static void main(String[] args) {
        SpringApplication.run(ThinkAndSpeak.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        String base = "http://localhost:" + serverPort;
        log.info("应用启动完成");
        log.info("Swagger UI: {}", base + swaggerPath);
        log.info("OpenAPI: {}/v3/api-docs", base);
        log.info("健康检查: {}/actuator/health (若启用)", base);
        log.info("对话创建: POST {}/api/conversations", base);
        log.info("获取会话: GET  {}/api/conversations/{id}", base);
        log.info("发送消息: POST {}/api/conversations/{id}/message", base);
    }

}
