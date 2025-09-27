import { chatApi } from './chat.api';
import type { SendMessageRequest } from './chat.types';

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