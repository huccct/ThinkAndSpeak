package xyz.mushan.backend.common.config;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

/**
 * @author mushan
 */
@Configuration
@EnableCaching
@EnableRetry
public class AppConfig {
    @Value("${id.snowflake.worker-id:1}")
    private long workerId;

    @Value("${id.snowflake.datacenter-id:1}")
    private long datacenterId;

    @Bean
    public Snowflake snowflake() {
        return IdUtil.getSnowflake(workerId, datacenterId);
    }
}
