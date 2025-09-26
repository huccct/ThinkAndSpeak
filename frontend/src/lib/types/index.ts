// 基础类型定义
export interface User {
  id: string;
  name?: string;
  email?: string;
}

// 技能开关
export interface SkillToggle {
  socratic: boolean;
  quotes: boolean;
  flashcards: boolean;
  memory: boolean;
}

// 消息类型
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  skills_output?: SkillsOutput;
}

// 技能输出
export interface SkillsOutput {
  quotes?: string[];
  flashcards?: Flashcard[];
  socratic_questions?: string[];
}

// 学习卡
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// 角色类型
export interface Character {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  sample_topics: string[];
  recommended_skills: SkillToggle;
  system_prompt: string;
  voice_settings?: VoiceSettings;
}

// 语音设置
export interface VoiceSettings {
  voice_id: string;
  speed: number;
  pitch: number;
}

// 会话类型
export interface Session {
  session_id: string;
  character_id: string;
  character_name: string;
  last_message: string;
  last_message_time: string;
  message_count: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

// 会话详情
export interface SessionDetail extends Session {
  messages: Message[];
  skills_used: SkillToggle;
}

// 用户设置
export interface UserSettings {
  llm_model: string;
  tts_voice: string;
  default_skills: SkillToggle;
  fallback_settings: FallbackSettings;
  performance_preferences: PerformancePreferences;
}

// 降级设置
export interface FallbackSettings {
  use_web_speech: boolean;
  use_local_tts: boolean;
}

// 性能偏好
export interface PerformancePreferences {
  response_speed: 'fast' | 'balanced' | 'quality';
  cost_optimization: boolean;
}

// API 请求类型
export interface ChatRequest {
  character_id: string;
  message: string;
  skills: SkillToggle;
  session_id?: string;
  conversation_history: Message[];
}

export interface ASRRequest {
  audio_data: string; // base64
  audio_format: string;
  language: string;
}

export interface TTSRequest {
  text: string;
  character_id: string;
  voice_settings: VoiceSettings;
}

// API 响应类型
export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    skills_output: SkillsOutput;
    session_id: string;
    character_id: string;
    timestamp: string;
  };
  error?: APIError;
}

export interface ASRResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
    language: string;
  };
  error?: APIError;
}

export interface TTSResponse {
  success: boolean;
  data?: {
    audio_url: string;
    audio_format: string;
    duration: number;
  };
  error?: APIError;
}

export interface CharactersResponse {
  success: boolean;
  data?: {
    characters: Character[];
  };
  error?: APIError;
}

export interface SessionsResponse {
  success: boolean;
  data?: {
    sessions: Session[];
    pagination: Pagination;
  };
  error?: APIError;
}

export interface SessionDetailResponse {
  success: boolean;
  data?: SessionDetail;
  error?: APIError;
}

export interface SettingsResponse {
  success: boolean;
  data?: UserSettings;
  error?: APIError;
}

// 分页信息
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// 错误类型
export interface APIError {
  code: string;
  message: string;
  details?: string;
}

// 应用状态
export interface AppState {
  // 用户状态
  currentUser: User | null;
  settings: UserSettings;
  
  // 角色状态
  characters: Character[];
  selectedCharacter: Character | null;
  
  // 对话状态
  currentSession: SessionDetail | null;
  messages: Message[];
  isRecording: boolean;
  isPlaying: boolean;
  
  // UI状态
  loading: boolean;
  error: string | null;
}
