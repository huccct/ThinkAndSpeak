package xyz.mushan.backend.modules.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import xyz.mushan.backend.common.base.ApiResponse;
import xyz.mushan.backend.common.util.IdConverter;
import xyz.mushan.backend.modules.chat.dto.CharacterDto;
import xyz.mushan.backend.modules.chat.dto.vo.CharacterCreateVo;
import xyz.mushan.backend.modules.chat.entity.CharacterEntity;
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
    public ApiResponse<List<CharacterDto>> list(@RequestParam(required = false) String q) {
        return ApiResponse.success(characterService.searchCharacters(q));
    }

    /**
     * 根据ID获取角色详情
     *
     * @param id 角色ID
     * @return 角色传输对象
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取角色详情", description = "根据角色ID获取角色详细信息")
    public ApiResponse<CharacterDto> get(@PathVariable String id) {
        return ApiResponse.success(characterService.getCharacterById(IdConverter.parse(id)));
    }

    /**
     * 创建角色
     * @param characterCreateVo 角色创建对象
     * @return 角色实体
     */
    @PostMapping
    @Operation(summary = "创建角色", description = "创建一个新的角色")
    public ApiResponse<CharacterEntity> create(@RequestBody CharacterCreateVo characterCreateVo) {
        return ApiResponse.success(characterService.createCharacter(characterCreateVo));
    }
}
