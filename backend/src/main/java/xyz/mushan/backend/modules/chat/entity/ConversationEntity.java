package xyz.mushan.backend.modules.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * @author mushan
 *         会话实体
 */
@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationEntity {
    /**
     * 会话ID(Long 雪花ID)
     */
    @Id
    private Long id;

    /**
     * 角色ID(Long 雪花ID)
     */
    private Long characterId;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 持久化前预处理
     * 设置创建时间和更新时间
     */
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    /**
     * 更新前预处理
     * 更新更新时间
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}