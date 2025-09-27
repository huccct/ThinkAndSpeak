package xyz.mushan.backend.modules.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import xyz.mushan.backend.modules.auth.entity.UserEntity;

import java.util.Optional;

/**
 * 用户数据访问接口
 * @author mushan
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    
    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @return 用户信息
     */
    Optional<UserEntity> findByUsername(String username);
}