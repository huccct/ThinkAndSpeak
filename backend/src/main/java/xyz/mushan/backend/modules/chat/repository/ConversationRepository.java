package xyz.mushan.backend.modules.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.mushan.backend.modules.chat.entity.ConversationEntity;

/**
 * @author mushan
 */
public interface ConversationRepository extends JpaRepository<ConversationEntity, Long> {
}
