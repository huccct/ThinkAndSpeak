package xyz.mushan.backend.modules.chat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * @author mushan
 *         角色实体
 */
@Entity
@Table(name = "characters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CharacterEntity {
    /**
     * 角色唯一标识符(Long 雪花ID)
     */
    @Id
    private Long id;

    /**
     * 角色名称
     */
    @Column(length = 255, nullable = false)
    private String name;

    /**
     * 角色标签，支持JSON格式或逗号分隔的字符串
     */
    @Column(columnDefinition = "TEXT")
    private String tags;

    /**
     * 角色设定或提示词(Prompt)
     */
    @Column(columnDefinition = "TEXT")
    private String persona;

    /**
     * 角色头像URL地址
     */
    @Column(length = 1024)
    private String portraitUrl;

    /**
     * 角色默认语音设置
     */
    @Column(length = 255)
    private String defaultVoice;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 版本号，用于乐观锁控制
     */
    @Version
    private Long version;

    /**
     * 实体持久化前的回调方法
     * 设置创建时间和更新时间
     */
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    /**
     * 实体更新前的回调方法
     * 更新更新时间
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}