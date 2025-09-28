import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsStore, SkillsSettings } from './settings.types';

const DEFAULT_SKILLS: SkillsSettings = {
  socratic: false,
  quotes: true,
  flashcards: true,
  memory: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      skills: DEFAULT_SKILLS,
      loading: false,
      error: undefined,

      updateSkills: (newSkills) => {
        set((state) => ({
          skills: { ...state.skills, ...newSkills },
        }));
      },

      resetSkills: () => {
        set({ skills: DEFAULT_SKILLS });
      },

      loadSettings: () => {
        set({ loading: true, error: undefined });
        try {
          // 从localStorage加载，persist中间件会自动处理
          set({ loading: false });
        } catch (error: any) {
          set({ 
            error: error?.message || '加载设置失败',
            loading: false 
          });
        }
      },

      saveSettings: () => {
        set({ loading: true, error: undefined });
        try {
          // persist中间件会自动保存到localStorage
          set({ loading: false });
        } catch (error: any) {
          set({ 
            error: error?.message || '保存设置失败',
            loading: false 
          });
        }
      },

      clearError: () => {
        set({ error: undefined });
      },
    }),
    {
      name: 'think-speak-settings',
      partialize: (state) => ({ skills: state.skills }),
    }
  )
);

// Selectors for better performance
export const useSkills = () => useSettingsStore((state) => state.skills);
export const useSkillsUpdate = () => useSettingsStore((state) => state.updateSkills);
export const useSettingsLoading = () => useSettingsStore((state) => state.loading);
export const useSettingsError = () => useSettingsStore((state) => state.error);
