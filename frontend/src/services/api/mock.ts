import type {
  ChatRequest,
  ChatResponse,
  ASRRequest,
  ASRResponse,
  TTSRequest,
  TTSResponse,
  CharactersResponse,
  SessionsResponse,
  SessionDetailResponse,
  SettingsResponse,
  Character,
  Session,
  SessionDetail,
  UserSettings,
  SkillToggle,
  Message,
} from '@/lib/types';

// Mock 角色数据
const mockCharacters: Character[] = [
  {
    id: 'harry_potter',
    name: '哈利·波特',
    description: '霍格沃茨的传奇巫师',
    avatar_url: '/avatars/harry.jpg',
    sample_topics: ['魔法世界', '友谊', '勇气', '冒险'],
    recommended_skills: {
      socratic: false,
      quotes: true,
      flashcards: true,
      memory: true,
    },
    system_prompt: '你是哈利·波特，霍格沃茨的传奇巫师。你勇敢、忠诚，经历过许多冒险。你说话时带有英国口音，喜欢谈论友谊、勇气和魔法世界的奇遇。',
    voice_settings: {
      voice_id: 'harry_voice',
      speed: 1.0,
      pitch: 1.0,
    },
  },
  {
    id: 'socrates',
    name: '苏格拉底',
    description: '古希腊哲学家',
    avatar_url: '/avatars/socrates.jpg',
    sample_topics: ['哲学', '智慧', '美德', '知识'],
    recommended_skills: {
      socratic: true,
      quotes: true,
      flashcards: true,
      memory: true,
    },
    system_prompt: '你是苏格拉底，古希腊的哲学家。你以苏格拉底式提问法著称，通过不断的提问来引导人们发现真理。你相信"我知道我一无所知"，并认为真正的智慧来自于认识到自己的无知。',
    voice_settings: {
      voice_id: 'socrates_voice',
      speed: 0.9,
      pitch: 0.8,
    },
  },
  {
    id: 'sherlock_holmes',
    name: '夏洛克·福尔摩斯',
    description: '著名侦探',
    avatar_url: '/avatars/sherlock.jpg',
    sample_topics: ['推理', '观察', '逻辑', '案件'],
    recommended_skills: {
      socratic: true,
      quotes: true,
      flashcards: false,
      memory: true,
    },
    system_prompt: '你是夏洛克·福尔摩斯，世界上最伟大的侦探。你拥有敏锐的观察力和逻辑推理能力。你说话时语调冷静、理性，喜欢通过细节推断真相。',
    voice_settings: {
      voice_id: 'sherlock_voice',
      speed: 1.1,
      pitch: 1.0,
    },
  },
];

// Mock 会话数据
const mockSessions: Session[] = [
  {
    session_id: 'session_001',
    character_id: 'harry_potter',
    character_name: '哈利·波特',
    last_message: '勇气不是没有恐惧，而是在恐惧面前依然前行。',
    last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    message_count: 12,
    duration_minutes: 25,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    session_id: 'session_002',
    character_id: 'socrates',
    character_name: '苏格拉底',
    last_message: '什么是真正的智慧？你认为你知道什么是正义吗？',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    message_count: 8,
    duration_minutes: 18,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4小时前
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

// Mock 用户设置
const mockUserSettings: UserSettings = {
  llm_model: 'gpt-4o-mini',
  tts_voice: 'default',
  default_skills: {
    socratic: false,
    quotes: true,
    flashcards: true,
    memory: true,
  },
  fallback_settings: {
    use_web_speech: true,
    use_local_tts: false,
  },
  performance_preferences: {
    response_speed: 'balanced',
    cost_optimization: true,
  },
};

// 生成Mock回复
function generateMockResponse(characterId: string, message: string, skills: SkillToggle): string {
  const character = mockCharacters.find(c => c.id === characterId);
  if (!character) return '抱歉，我不太明白你的意思。';

  const responses = {
    harry_potter: [
      '你好！我是哈利·波特。很高兴见到你！',
      '在霍格沃茨，我学到了很多东西，最重要的就是友谊和勇气。',
      '你知道吗？真正的勇气不是没有恐惧，而是在恐惧面前依然前行。',
      '我的朋友赫敏总是说："知识就是力量。"我觉得她说得对。',
    ],
    socrates: [
      '你好，我的朋友。你知道什么是真正的智慧吗？',
      '让我问你一个问题：你认为什么是正义？',
      '我发现，真正的智慧来自于认识到自己的无知。',
      '通过提问，我们可以一起探索真理。你觉得呢？',
    ],
    sherlock_holmes: [
      '有趣，非常有趣。让我仔细观察一下...',
      '从你的话语中，我可以推断出一些有趣的信息。',
      '逻辑推理是解决一切问题的关键。',
      '细节决定成败，我的朋友。',
    ],
  };

  const characterResponses = responses[characterId as keyof typeof responses] || responses.harry_potter;
  return characterResponses[Math.floor(Math.random() * characterResponses.length)];
}

// 生成技能输出
function generateSkillsOutput(skills: SkillToggle): any {
  const output: any = {};

  if (skills.quotes) {
    output.quotes = [
      '知识就是力量，但智慧在于如何运用它。',
      '真正的勇气是在恐惧面前依然前行。',
    ];
  }

  if (skills.flashcards) {
    output.flashcards = [
      {
        id: 'card_001',
        question: '什么是真正的智慧？',
        answer: '认识到自己的无知',
        category: '哲学思考',
      },
      {
        id: 'card_002',
        question: '勇气的定义是什么？',
        answer: '在恐惧面前依然选择做正确的事情',
        category: '道德品质',
      },
    ];
  }

  if (skills.socratic) {
    output.socratic_questions = [
      '你认为这个问题还有其他可能的答案吗？',
      '如果换一个角度思考，你会得出什么结论？',
    ];
  }

  return output;
}

// Mock API 实现
export const mockAPI = {
  // 文本对话
  async chat(data: ChatRequest): Promise<ChatResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generateMockResponse(data.character_id, data.message, data.skills);
    const skillsOutput = generateSkillsOutput(data.skills);

    return {
      success: true,
      data: {
        message: response,
        skills_output: skillsOutput,
        session_id: data.session_id || `session_${Date.now()}`,
        character_id: data.character_id,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // 语音转文本
  async asr(data: ASRRequest): Promise<ASRResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      data: {
        text: '这是模拟的语音识别结果',
        confidence: 0.95,
        language: data.language,
      },
    };
  },

  // 文本转语音
  async tts(data: TTSRequest): Promise<TTSResponse> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      success: true,
      data: {
        audio_url: `https://mock-tts.example.com/audio_${Date.now()}.wav`,
        audio_format: 'wav',
        duration: data.text.length * 0.1, // 简单估算
      },
    };
  },

  // 获取角色列表
  async getCharacters(): Promise<CharactersResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      data: {
        characters: mockCharacters,
      },
    };
  },

  // 获取会话列表
  async getSessions(): Promise<SessionsResponse> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      success: true,
      data: {
        sessions: mockSessions,
        pagination: {
          total: mockSessions.length,
          limit: 20,
          offset: 0,
          has_more: false,
        },
      },
    };
  },

  // 获取会话详情
  async getSession(sessionId: string): Promise<SessionDetailResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const session = mockSessions.find(s => s.session_id === sessionId);
    if (!session) {
      return {
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: '会话不存在',
        },
      };
    }

    // 生成模拟消息
    const messages: Message[] = [
      {
        role: 'user',
        content: '你好',
        timestamp: session.created_at,
      },
      {
        role: 'assistant',
        content: session.last_message,
        timestamp: session.last_message_time,
      },
    ];

    const sessionDetail: SessionDetail = {
      ...session,
      messages,
      skills_used: {
        socratic: false,
        quotes: true,
        flashcards: true,
        memory: true,
      },
    };

    return {
      success: true,
      data: sessionDetail,
    };
  },

  // 删除会话
  async deleteSession(sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // 获取设置
  async getSettings(): Promise<SettingsResponse> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      data: mockUserSettings,
    };
  },

  // 更新设置
  async updateSettings(settings: Partial<UserSettings>): Promise<SettingsResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    Object.assign(mockUserSettings, settings);

    return {
      success: true,
      data: mockUserSettings,
    };
  },
};
