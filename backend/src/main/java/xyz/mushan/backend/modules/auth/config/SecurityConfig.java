package xyz.mushan.backend.modules.auth.config;

import io.micrometer.common.lang.NonNull;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import xyz.mushan.backend.common.security.JwtUtil;
import xyz.mushan.backend.modules.auth.repository.UserRepository;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.util.Collections;
import java.util.Map;

/**
 * 安全配置类，用于配置Spring Security的相关设置
 *
 * @author mushan
 */
@Configuration
@AllArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * 密码加密器配置，使用BCrypt算法进行密码加密
     *
     * @return BCrypt密码加密器实例
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 数据访问认证提供者配置，用于处理用户认证逻辑
     *
     * @param userDetailsService 用户详情服务
     * @param passwordEncoder 密码加密器
     * @return 数据访问认证提供者实例
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
                                                            PasswordEncoder passwordEncoder) {
        // 通过构造函数注入 UserDetailsService
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        // 密码加密器仍然可以用 setter 设置
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    /**
     * 认证管理器配置，使用数据访问认证提供者进行认证
     *
     * @param authenticationProvider 数据访问认证提供者
     * @return 认证管理器实例
     */
    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider authenticationProvider) {
        return new ProviderManager(Collections.singletonList(authenticationProvider));
    }

    /**
     * 安全过滤链配置，定义HTTP请求的安全策略
     *
     * @param http HTTP安全配置对象
     * @return 安全过滤链
     * @throws Exception 配置异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 禁用CSRF保护
                .csrf(AbstractHttpConfigurer::disable)
                // 启用CORS支持
                .cors(Customizer.withDefaults())
                // 设置会话管理策略为无状态
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 配置请求授权规则
                .authorizeHttpRequests(auth -> auth
                        // 允许访问Swagger相关接口
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()
                        // 允许所有OPTIONS请求
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // 允许登录和注册接口无需认证
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        // 其他所有请求都需要认证
                        .anyRequest().authenticated())
                // 在用户名密码认证过滤器之前添加自定义令牌过滤器
                .addFilterBefore(tokenFilter(), UsernamePasswordAuthenticationFilter.class)
                // 禁用HTTP基本认证
                .httpBasic(AbstractHttpConfigurer::disable)
                // 禁用表单登录
                .formLogin(AbstractHttpConfigurer::disable);
        return http.build();
    }

    /**
     * 自定义令牌过滤器，用于验证请求中的Bearer Token
     *
     * @return 令牌过滤器实例
     */
    @Bean
    public OncePerRequestFilter tokenFilter() {
        return new OncePerRequestFilter() {
            /**
             * 过滤器核心方法，用于验证请求头中的Authorization字段
             *
             * @param request 请求对象
             * @param response 响应对象
             * @param filterChain 过滤器链
             * @throws ServletException Servlet异常
             * @throws IOException IO异常
             */
            @Override
            protected void doFilterInternal(@Nonnull HttpServletRequest request,
                                            @NonNull HttpServletResponse response,
                                            @NonNull FilterChain filterChain) throws ServletException, IOException {

                // 获取请求头中的Authorization字段
                String authHeader = request.getHeader("Authorization");

                // 检查是否存在Bearer Token
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    // 提取令牌值
                    String token = authHeader.substring(7);

                    // 验证令牌是否匹配配置的令牌值
                    if (jwtUtil.verifyToken(token)) {
                        Map<String, Object> claims = jwtUtil.parseToken(token);
                        String username = (String) claims.get("username");

                        // 创建认证对象并设置到安全上下文中
                        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null,
                                Collections.singletonList(new SimpleGrantedAuthority("USER")));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }

                // 继续执行过滤器链
                filterChain.doFilter(request, response);
            }
        };
    }
}
