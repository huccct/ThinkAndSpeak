import { create } from 'zustand';
import { chatApi } from './chat.api';
import type { SendMessageRequest, ConversationMessage } from './chat.types';

type ChatState = {
  conversations: Record<string, string>; // characterId -> conversationId
  loading: boolean;
  error?: string;
};

type ChatActions = {
  createConversation: (characterId: string) => Promise<string>;
  sendMessage: (conversationId: string, text: string) => Promise<string>;
  getConversation: (conversationId: string) => Promise<ConversationMessage[]>;
  getExistingConversationId: (characterId: string) => string | null;
  saveConversationId: (characterId: string, conversationId: string) => void;
  clearError: () => void;
  clearAllConversations: () => void;
};

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  conversations: {},
  loading: false,
  error: undefined,

  createConversation: async (characterId: string) => {
    set({ loading: true, error: undefined });
    try {
      const res = await chatApi.createConversation({ characterId: characterId });
      if (res.code !== 0) throw new Error(res.message || 'create conversation failed');
      
      const conversationId = res.data.conversationId;
      // 保存到本地存储
      if (typeof window !== 'undefined') {
        localStorage.setItem(`conversation_${characterId}`, conversationId);
      }
      
      // 更新store状态
      set(state => ({
        conversations: { ...state.conversations, [characterId]: conversationId }
      }));
      
      return conversationId;
    } catch (error: any) {
      set({ error: error?.message || 'create conversation failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId: string, text: string) => {
    set({ loading: true, error: undefined });
    try {
      const payload: SendMessageRequest = { text };
      const res = await chatApi.sendMessage(conversationId, payload);
      if (res.code !== 0) throw new Error(res.message || 'send message failed');
      return res.data.reply;
    } catch (error: any) {
      set({ error: error?.message || 'send message failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getConversation: async (conversationId: string) => {
    set({ loading: true, error: undefined });
    try {
      const res = await chatApi.getConversation(conversationId);
      if (res.code !== 0) throw new Error(res.message || 'get conversation failed');
      return res.data.messages;
    } catch (error: any) {
      set({ error: error?.message || 'get conversation failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getExistingConversationId: (characterId: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`conversation_${characterId}`);
  },

  saveConversationId: (characterId: string, conversationId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`conversation_${characterId}`, conversationId);
    set(state => ({
      conversations: { ...state.conversations, [characterId]: conversationId }
    }));
  },

  clearError: () => {
    set({ error: undefined });
  },

  clearAllConversations: () => {
    // 清除localStorage中的所有会话
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('conversation_')) {
          localStorage.removeItem(key);
        }
      });
    }
    // 清除store中的会话状态
    set({ conversations: {} });
  },
}));

// selectors
export const useChatLoading = () => useChatStore(s => s.loading);
export const useChatError = () => useChatStore(s => s.error);

// 分离的action选择器，避免返回新对象
export const useChatCreateConversation = () => useChatStore(s => s.createConversation);
export const useChatSendMessage = () => useChatStore(s => s.sendMessage);
export const useChatGetConversation = () => useChatStore(s => s.getConversation);
export const useChatGetExistingConversationId = () => useChatStore(s => s.getExistingConversationId);
export const useChatSaveConversationId = () => useChatStore(s => s.saveConversationId);
export const useChatClearError = () => useChatStore(s => s.clearError);
export const useChatClearAllConversations = () => useChatStore(s => s.clearAllConversations);