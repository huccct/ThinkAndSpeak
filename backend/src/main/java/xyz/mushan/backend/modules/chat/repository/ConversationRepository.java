package xyz.mushan.backend.modules.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.mushan.backend.modules.chat.entity.ConversationEntity;

import java.util.List;

/**
 * @author mushan
 */
public interface ConversationRepository extends JpaRepository<ConversationEntity, Long> {
    /**
     * 根据用户ID查询会话
     * @param userId 用户ID
     * @return 会话列表
     */
    List<ConversationEntity> findByUserId(String userId);
}
