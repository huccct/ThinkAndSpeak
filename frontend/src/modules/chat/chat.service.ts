import { chatApi } from './chat.api';
import type { SendMessageRequest, ConversationMessage } from './chat.types';

const FIXED_USER_ID = 'demo-user-0001';

export async function createConversation(characterId: string): Promise<string> {
  const res = await chatApi.createConversation({ characterId, userId: FIXED_USER_ID });
  if (res.code !== 0) throw new Error(res.message || 'create conversation failed');
  return res.data.conversationId;
}

export async function sendChatMessage(conversationId: string, text: string, persona: string): Promise<string> {
  const payload: SendMessageRequest = { text, persona };
  const res = await chatApi.sendMessage(conversationId, payload);
  if (res.code !== 0) throw new Error(res.message || 'send message failed');
  return res.data.reply;
}

export async function getConversation(conversationId: string): Promise<ConversationMessage[]> {
  const res = await chatApi.getConversation(conversationId);
  if (res.code !== 0) throw new Error(res.message || 'get conversation failed');
  return res.data.messages;
}

// 检查是否已有该角色的会话（通过本地存储）
export function getExistingConversationId(characterId: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`conversation_${characterId}`);
}

// 保存会话ID到本地存储
export function saveConversationId(characterId: string, conversationId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`conversation_${characterId}`, conversationId);
}