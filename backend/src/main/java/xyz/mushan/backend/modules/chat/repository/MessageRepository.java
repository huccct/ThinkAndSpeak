package xyz.mushan.backend.modules.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.mushan.backend.modules.chat.entity.MessageEntity;

import java.util.List;

/**
 * @author mushan
 *         消息数据访问接口
 */
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    /**
     * 根据会话ID查询消息列表，按创建时间升序排列
     * 
     * @param sessionId 会话ID
     * @return 消息列表
     */
    List<MessageEntity> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}