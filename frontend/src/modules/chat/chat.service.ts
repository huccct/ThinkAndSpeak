import { chatApi } from './chat.api';

const FIXED_USER_ID = 'demo-user-0001';

export async function createConversation(characterId: string): Promise<string> {
  const res = await chatApi.createConversation({ characterId, userId: FIXED_USER_ID });
  if (res.code !== 0) throw new Error(res.message || 'create conversation failed');
  return res.data.conversationId;
}