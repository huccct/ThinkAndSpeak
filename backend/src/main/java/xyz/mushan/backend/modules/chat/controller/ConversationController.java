package xyz.mushan.backend.modules.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import xyz.mushan.backend.common.util.IdConverter;
import xyz.mushan.backend.common.base.ApiResponse;
import xyz.mushan.backend.modules.auth.dto.LoginUser;
import xyz.mushan.backend.modules.auth.utils.SecurityUtil;
import xyz.mushan.backend.modules.chat.dto.CharacterDto;
import xyz.mushan.backend.modules.chat.dto.ConversationDto;
import xyz.mushan.backend.modules.chat.dto.MessageDto;
import xyz.mushan.backend.modules.chat.entity.ConversationEntity;
import xyz.mushan.backend.modules.chat.service.CharacterService;
import xyz.mushan.backend.modules.chat.service.ChatService;
import xyz.mushan.backend.modules.chat.service.ConversationService;

import xyz.mushan.backend.modules.chat.dto.request.CreateConversationRequest;
import xyz.mushan.backend.modules.chat.dto.request.SendMessageRequest;

import xyz.mushan.backend.modules.chat.dto.response.CreateConversationResponse;
import xyz.mushan.backend.modules.chat.dto.response.SendMessageResponse;
import xyz.mushan.backend.modules.llm.adapter.enums.LLMProvider;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * @author mushan
 * 会话控制器，处理会话相关的HTTP请求
 */
@RestController
@RequestMapping("/api/chat/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversation API", description = "会话相关接口")
public class ConversationController {
    private final CharacterService characterService;
    private final ConversationService conversationService;
    private final ChatService chatService;

    /**
     * 创建新的会话
     *
     * @param body 包含角色ID和用户ID的请求体
     * @return 包含新创建会话ID的响应
     */
    @PostMapping
    @Operation(summary = "创建会话", description = "创建一个新的会话")
    public ApiResponse<CreateConversationResponse> createConversation(
            @Parameter(description = "请求体，包含characterId和userId")
            @Valid
            @RequestBody
            CreateConversationRequest body) {
        LoginUser loginUser = SecurityUtil.getCurrentUser();
        ConversationEntity conv = conversationService.createConversation(IdConverter.parse(body.getCharacterId()), loginUser.getUserId());
        return ApiResponse.success(new CreateConversationResponse(conv.getId().toString()));
    }

    /**
     * 获取会话详情
     *
     * @param id 会话ID
     * @return 会话数据传输对象
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取会话", description = "根据会话ID获取会话详情和消息历史")
    public ApiResponse<ConversationDto> getConversation(
            @Parameter(description = "会话ID") @PathVariable("id") String id) {
        return ApiResponse.success(conversationService.getConversation(Long.valueOf(id)));
    }

    /**
     * 用户历史会话
     *
     * @return 会话数据传输对象数组
     */
    @GetMapping("/history")
    @Operation(summary = "用户历史会话", description = "获取当前用户的历史会话")
    public ApiResponse<List<ConversationDto>> getHistory() {
        LoginUser loginUser = SecurityUtil.getCurrentUser();
        return ApiResponse.success(conversationService.getHistory(Objects.requireNonNull(loginUser).getUserId()));
    }

    /**
     * 发送消息到会话
     *
     * @param id   会话ID
     * @param body 包含消息内容和角色设定的请求体
     * @return 包含回复内容和助手消息ID的响应
     */
    @PostMapping("/{id}/message")
    @Operation(summary = "发送消息", description = "向指定会话发送消息并获取回复")
    public ApiResponse<SendMessageResponse> sendMessage(
            @Parameter(description = "会话ID") @PathVariable("id") String id,
            @Parameter(description = "请求体，包含text和persona") @RequestBody SendMessageRequest body) {
        String text = Optional.ofNullable(body.getText()).orElse("");
        // 保存用户消息
        conversationService.appendMessage(IdConverter.parse(id), "USER", text, null);
        // 读取历史（简化：按 conversation 全部消息）
        ConversationDto conversation = conversationService.getConversation(IdConverter.parse(id));
        CharacterDto character = characterService.getCharacterById(conversation.characterId());
        String persona = Optional.ofNullable(character.persona()).orElse("");
        StringBuilder historySb = new StringBuilder();
        conversation.messages()
                .forEach(m -> historySb.append(m.sender()).append(": ").append(m.content()).append("\n"));
        String history = historySb.toString();
        // 获取回复
        String reply = chatService.generateReply(persona, history, text, LLMProvider.GEMINI);
        MessageDto assistantMsg = conversationService.appendMessage(Long.valueOf(id), "CHARACTER", reply, null);
        return ApiResponse.success(new SendMessageResponse(reply, assistantMsg.id()));
    }

    /**
     * 流式聊天接口
     * 使用SSE实现实时回复
     */
    @GetMapping("/{id}/stream_message")
    public SseEmitter streamChat(@PathVariable("id") String id,
                                 @RequestParam String message,
                                 @RequestParam(required = false) String persona,
                                 @RequestParam(required = false) String history,
                                 @RequestParam(defaultValue = "OLLAMA") LLMProvider provider) {
        // 设置超时时间
        SseEmitter emitter = new SseEmitter(1000L);

        // 调用流式生成方法
        chatService.generateReplyStream(persona, history, message, provider,
                chunk -> {
                    try {
                        emitter.send(chunk);
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                },
                emitter::completeWithError,
                emitter::complete
        );

        return emitter;
    }
}
