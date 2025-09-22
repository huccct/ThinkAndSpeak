package xyz.mushan.backend.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

/**
 * @author mushan
 */
@Configuration
@EnableCaching
@EnableRetry
public class AppConfig {
}
