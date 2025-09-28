package xyz.mushan.backend.modules.auth.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.lang.Snowflake;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.mushan.backend.common.util.security.JwtUtil;
import xyz.mushan.backend.modules.auth.dto.AuthResponse;
import xyz.mushan.backend.modules.auth.dto.LoginRequest;
import xyz.mushan.backend.modules.auth.dto.LoginUser;
import xyz.mushan.backend.modules.auth.dto.RegisterRequest;
import xyz.mushan.backend.modules.auth.entity.UserEntity;
import xyz.mushan.backend.modules.auth.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

/**
 * @author mushan
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final Snowflake snowflake;

    /**
     * 用户注册方法
     * @param request 注册请求参数
     */
    @Transactional
    public void register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new RuntimeException("用户已存在");
        }

        // 创建新用户并加密密码
        UserEntity user = new UserEntity();
        user.setId(snowflake.nextId());
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));

        // 保存用户到数据库
        userRepository.save(user);
    }

    /**
     * 用户登录方法
     * @param request 登录请求参数
     * @return 认证响应，包含JWT token
     */
    public AuthResponse login(LoginRequest request) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.username(), request.password());
        // 认证
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        // 认证成功后，Spring Security 会自动把 UserDetails 放到 authentication.getPrincipal()
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // 生成 JWT
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", loginUser.getUsername());
        claims.put("userId", loginUser.getUserId());

        String token = jwtUtil.generateToken(claims);
        return new AuthResponse(token);
    }
}