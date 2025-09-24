package xyz.mushan.backend.modules.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import xyz.mushan.backend.modules.chat.dto.CharacterDto;
import xyz.mushan.backend.modules.chat.service.CharacterService;

import java.util.List;

/**
 * @author mushan
 * 角色控制器，提供角色相关的API接口
 */
@RestController
@RequestMapping("/api/chat/characters")
@RequiredArgsConstructor
@Tag(name = "角色管理", description = "提供角色相关的API接口")
public class CharacterController {
    private final CharacterService characterService;

    /**
     * 获取角色列表
     * 
     * @param q 搜索关键字，可选参数
     * @return 角色传输对象列表
     */
    @GetMapping
    @Operation(summary = "获取角色列表", description = "根据搜索关键字获取角色列表，如果不提供关键字则返回所有角色")
    public List<CharacterDto> list(@RequestParam(required = false) String q) {
        return characterService.searchCharacters(q);
    }

    /**
     * 根据ID获取角色详情
     * 
     * @param id 角色ID
     * @return 角色传输对象
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取角色详情", description = "根据角色ID获取角色详细信息")
    public CharacterDto get(@PathVariable String id) {
        return characterService.getCharacterById(Long.valueOf(id));
    }
}
