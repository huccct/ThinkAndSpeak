package xyz.mushan.backend.modules.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import xyz.mushan.backend.common.base.ApiResponse;
import xyz.mushan.backend.modules.auth.dto.AuthResponse;
import xyz.mushan.backend.modules.auth.dto.LoginRequest;
import xyz.mushan.backend.modules.auth.dto.RegisterRequest;
import xyz.mushan.backend.modules.auth.service.AuthService;

/**
 * @author mushan
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证接口", description = "提供用户注册和登录功能")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "注册新用户")
    public ApiResponse<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success();
    }

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录并获取JWT token")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }
}