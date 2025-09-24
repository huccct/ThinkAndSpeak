package xyz.mushan.backend.modules.chat.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import xyz.mushan.backend.modules.chat.dto.CharacterDto;
import xyz.mushan.backend.modules.chat.entity.CharacterEntity;
import xyz.mushan.backend.modules.chat.repository.CharacterRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author mushan
 *         角色服务类，提供角色相关的业务逻辑处理
 */
@Service
@RequiredArgsConstructor
public class CharacterService {
    private final CharacterRepository characterRepository;

    /**
     * 根据ID获取角色信息
     * 
     * @param id 角色ID
     * @return 角色传输对象
     * @throws RuntimeException 当角色不存在时抛出异常
     */
    @Cacheable(value = "character", key = "#id")
    public CharacterDto getCharacterById(Long id) {
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
}
