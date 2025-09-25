export type SkillToggle = {
  socratic?: boolean; // 追问
  quotes?: boolean;   // 金句
  flashcards?: boolean; // 学习卡
  memory?: boolean;   // 会话摘要记忆
};

export function buildSkillDirectives(t: SkillToggle) {
  const parts: string[] = [];
  if (t.socratic)
    parts.push(
      "启用Socratic模式：用问题引导用户思考。每轮优先返回1-2个关键问题，再给出简短提示。"
    );
  if (t.quotes)
    parts.push(
      "启用金句提炼：在结尾给出一行【金句】：不超过20字，便于复述/口播。"
    );
  if (t.flashcards)
    parts.push(
      "启用学习卡：当用户请求总结/学习时，生成三张闪卡，格式：Q:..., A:..., Tip:..."
    );
  if (t.memory)
    parts.push(
      "启用会话记忆：请在系统内部维持不超过100字的滚动摘要，保证人设和主题一致性。"
    );
  return parts.join("\n");
}

export function applyResponsePostProcessing(
  text: string,
  t: SkillToggle
): {
  answer: string;
  quotes?: string[];
  flashcards?: { q: string; a: string; tip?: string }[];
} {
  const res: any = { answer: text.trim() };
  if (t.quotes) {
    const m = text.match(/【金句】：(.+)$/m);
    if (m) res.quotes = [m[1].trim()];
  }
  return res;
}
