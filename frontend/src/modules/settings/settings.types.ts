export type SkillsSettings = {
  socratic: boolean;
  quotes: boolean;
  flashcards: boolean;
  memory: boolean;
};

export type SettingsState = {
  skills: SkillsSettings;
  loading: boolean;
  error?: string;
};

export type SettingsActions = {
  updateSkills: (skills: Partial<SkillsSettings>) => void;
  resetSkills: () => void;
  loadSettings: () => void;
  saveSettings: () => void;
  clearError: () => void;
};

export type SettingsStore = SettingsState & SettingsActions;
