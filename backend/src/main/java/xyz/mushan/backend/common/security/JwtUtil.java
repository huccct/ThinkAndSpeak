package xyz.mushan.backend.common.security;

import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * @author mushan
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;

    // 生成 token
    public String generateToken(Map<String, Object> claims) {
        return JWT.create()
                .addPayloads(claims)
                .setKey(jwtProperties.getSecret().getBytes())
                .sign();
    }

    // 验证 token
    public boolean verifyToken(String token) {
        return JWT.of(token)
                .setKey(jwtProperties.getSecret().getBytes())
                .verify();
    }

    // 解析 token
    public Map<String, Object> parseToken(String token) {
        return JWTUtil.parseToken(token).getPayloads();
    }
}