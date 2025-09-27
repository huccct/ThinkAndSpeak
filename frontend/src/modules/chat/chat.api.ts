import { http } from '@/lib/http';
import type { CreateConversationRequest, CreateConversationResponse } from './chat.types';

/**
 * create conversation
 */
export const chatApi = {
  createConversation: (payload: CreateConversationRequest) =>
    http.post<CreateConversationResponse>('/api/chat/conversations', payload),
};


