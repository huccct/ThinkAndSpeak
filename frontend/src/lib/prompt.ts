import { buildSkillDirectives } from "./skills";
import type { SkillToggle } from "./skills";

export function buildSystemPrompt(params: {
  characterSystem: string;
  skills: SkillToggle;
}) {
  const { characterSystem, skills } = params;
  return [
    characterSystem,
    "通用约束：",
    "- 回答简洁、结构清晰，优先口语化。",
    "- 若不确定，明确说明不确定并提出下一步方法。",
    "- 绝不输出个人隐私数据或编造具体来源。",
    buildSkillDirectives(skills),
    "输出标记：若启用金句，请在末尾追加一行：【金句】：...。",
  ]
    .filter(Boolean)
    .join("\n");
}
