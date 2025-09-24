package xyz.mushan.backend.modules.chat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.mushan.backend.modules.chat.dto.ConversationDto;
import xyz.mushan.backend.modules.chat.entity.ConversationEntity;
import xyz.mushan.backend.modules.chat.repository.ConversationRepository;
import xyz.mushan.backend.modules.chat.dto.MessageDto;
import xyz.mushan.backend.modules.chat.entity.MessageEntity;
import xyz.mushan.backend.modules.chat.repository.MessageRepository;

import java.time.LocalDateTime;
import java.util.List;
import cn.hutool.core.lang.Snowflake;
import java.util.stream.Collectors;

/**
 * @author mushan
 *         会话服务类，用于处理会话相关的业务逻辑
 */
@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final Snowflake snowflake;

    /**
     * 创建新的会话
     * 
     * @param characterId 角色ID
     * @param userId      用户ID（当前未使用）
     * @return 创建的会话实体
     */
    @Transactional
    public ConversationEntity createConversation(Long characterId, String userId) {
        ConversationEntity conv = ConversationEntity.builder()
                .id(snowflake.nextId())
                .characterId(characterId)
                .build();
        conv.setCreatedAt(LocalDateTime.now());
        conv.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conv);
    }

    /**
     * 获取会话详情，包括会话信息和所有消息
     * 
     * @param conversationId 会话ID
     * @return 会话数据传输对象
     */
    @Transactional(readOnly = true)
    public ConversationDto getConversation(Long conversationId) {
        ConversationEntity conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        List<MessageEntity> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<MessageDto> dtos = messages.stream()
                .map(m -> new MessageDto(m.getId(), m.getSender(), m.getContent(), m.getMetadata(), m.getCreatedAt()))
                .collect(Collectors.toList());
        return new ConversationDto(conv.getId(), conv.getCharacterId(), dtos);
    }

    /**
     * 向会话中追加消息
     * 
     * @param conversationId 会话ID
     * @param sender         消息发送者
     * @param content        消息内容
     * @param metadata       消息元数据
     * @return 消息数据传输对象
     */
    @Transactional
    public MessageDto appendMessage(Long conversationId, String sender, String content, String metadata) {
        ConversationEntity conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        MessageEntity me = MessageEntity.builder()
                .id(snowflake.nextId())
                .conversationId(conversationId)
                .sender(sender)
                .content(content)
                .metadata(metadata)
                .build();
        me.setCreatedAt(LocalDateTime.now());
        messageRepository.save(me);

        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        return new MessageDto(me.getId(), me.getSender(), me.getContent(), me.getMetadata(), me.getCreatedAt());
    }
}
