package xyz.mushan.backend.modules.demo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.mushan.backend.common.base.ApiResponse;

/**
 * @author mushan
 */
@Tag(name = "系统接口", description = "系统接口")
@RestController
@RequestMapping("/api/demo/test")
public class SystemController {

    @Operation(summary = "测试", description = "测试")
    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("pong");
    }
}
