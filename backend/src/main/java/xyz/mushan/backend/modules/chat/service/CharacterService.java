package xyz.mushan.backend.modules.chat.service;

import cn.hutool.core.lang.Snowflake;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import xyz.mushan.backend.modules.chat.dto.CharacterDto;
import xyz.mushan.backend.modules.chat.dto.vo.CharacterCreateVo;
import xyz.mushan.backend.modules.chat.entity.CharacterEntity;
import xyz.mushan.backend.modules.chat.repository.CharacterRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author mushan
 * 角色服务类，提供角色相关的业务逻辑处理
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CharacterService {
    private final CharacterRepository characterRepository;
    private final Snowflake snowflake;

    /**
     * 根据ID获取角色信息
     * 
     * @param id 角色ID
     * @return 角色传输对象
     * @throws RuntimeException 当角色不存在时抛出异常
     */
    @Cacheable(value = "character", key = "#id")
    public CharacterDto getCharacterById(Long id) {
        log.info("Fetching character by id: {}", id);
        CharacterEntity c = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));
        return new CharacterDto(c.getId(), c.getName(), c.getTags(), c.getPersona(), c.getPortraitUrl());
    }

    /**
     * 搜索角色信息
     * 
     * @param q 搜索关键字，如果为空或空白则返回所有角色
     * @return 角色传输对象列表
     */
    public List<CharacterDto> searchCharacters(String q) {
        List<CharacterEntity> list;
        if (StringUtils.isBlank(q)) {
            list = characterRepository.findAll();
        } else {
            list = characterRepository.findByNameContainingIgnoreCase(q);
        }
        return list.stream()
                .map(c -> new CharacterDto(c.getId(), c.getName(), c.getTags(), c.getPersona(), c.getPortraitUrl()))
                .collect(Collectors.toList());
    }

    /**
     * 创建角色
     * @param characterCreateVo 角色创建对象
     * @return 角色实体
     */
    public CharacterEntity createCharacter(CharacterCreateVo characterCreateVo) {
        CharacterEntity characterEntity = new CharacterEntity();
        characterEntity.setId(snowflake.nextId());
        BeanUtils.copyProperties(characterCreateVo, characterEntity);
        return characterRepository.save(characterEntity);
    }
}
