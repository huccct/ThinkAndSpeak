"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSkills, useSkillsUpdate } from "@/modules/settings/settings.store";
import type { SkillsSettings } from "@/modules/settings/settings.types";

interface SkillsSettingsProps {
  className?: string;
}

const SKILL_DESCRIPTIONS: Record<keyof SkillsSettings, { label: string; description: string }> = {
  socratic: {
    label: "苏格拉底式提问",
    description: "AI会通过提问引导你思考，而不是直接给出答案"
  },
  quotes: {
    label: "名言引用",
    description: "AI会在回复中引用相关的名言或经典语录"
  },
  flashcards: {
    label: "记忆卡片",
    description: "AI会生成记忆卡片帮助巩固知识点"
  },
  memory: {
    label: "记忆功能",
    description: "AI会记住之前的对话内容，提供连贯的体验"
  }
};

export default function SkillsSettings({ className }: SkillsSettingsProps) {
  const skills = useSkills();
  const updateSkills = useSkillsUpdate();

  const handleSkillChange = (skill: keyof SkillsSettings, checked: boolean) => {
    updateSkills({ [skill]: checked });
  };

  return (
    <Card className={`bg-transparent border-2 border-white/20 ${className}`}>
      <CardHeader className="px-5 pb-3">
        <CardTitle className="text-white uppercase tracking-wide text-sm">
          技能开关
        </CardTitle>
        <p className="text-xs text-white/60">
          选择你希望AI在对话中使用的技能
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-4">
          {Object.entries(SKILL_DESCRIPTIONS).map(([skill, config]) => (
            <div key={skill} className="flex items-start gap-3">
              <Checkbox
                id={skill}
                checked={skills[skill as keyof SkillsSettings]}
                onCheckedChange={(checked) => 
                  handleSkillChange(skill as keyof SkillsSettings, checked as boolean)
                }
                className="mt-1 border-2 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <div className="flex-1">
                <label 
                  htmlFor={skill}
                  className="text-sm font-medium text-white cursor-pointer block"
                >
                  {config.label}
                </label>
                <p className="text-xs text-white/60 mt-1">
                  {config.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
