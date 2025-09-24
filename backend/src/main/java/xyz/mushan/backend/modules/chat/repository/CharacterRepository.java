package xyz.mushan.backend.modules.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.mushan.backend.modules.chat.entity.CharacterEntity;

import java.util.List;

/**
 * @author mushan
 */
public interface CharacterRepository extends JpaRepository<CharacterEntity, Long> {
    /**
     * 根据名称模糊查询角色信息（忽略大小写）
     * 
     * @param q 查询关键字
     * @return 符合条件的角色列表
     */
    List<CharacterEntity> findByNameContainingIgnoreCase(String q);
}
