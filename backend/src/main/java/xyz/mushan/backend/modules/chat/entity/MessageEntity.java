package xyz.mushan.backend.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * @author mushan
 *         对话消息实体，一个对话中的多条消息
 */
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "messages")
public class MessageEntity {
    /**
     * 消息唯一标识符(Long 雪花ID)
     */
    @Id
    private Long id;

    /**
     * 所属对话ID(Long 雪花ID)
     */
    @Column(nullable = false)
    private Long conversationId;

    /**
     * 消息发送者类型
     * USER: 用户发送的消息
     * CHARACTER: 角色发送的消息
     * SYSTEM: 系统消息
     */
    @Column(length = 50, nullable = false)
    private String sender;

    /**
     * 消息内容
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * 消息元数据，JSON格式
     * 可包含语音URL、表情等附加信息
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    /**
     * 消息创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 实体持久化前的预处理操作
     * 自动设置创建时间
     */
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}