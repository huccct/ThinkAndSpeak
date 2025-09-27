import { createHttpClient } from '@/lib/http';
import type { CreateConversationRequest, CreateConversationResponse, SendMessageRequest, SendMessageResponse, GetConversationResponse } from './chat.types';

export const chatApi = {
  /**
   * create conversation
   */
  createConversation: (payload: CreateConversationRequest) => {
    const http = createHttpClient();
    return http.post<CreateConversationResponse>('/api/chat/conversations', payload);
  },

  /**
   * send message to conversation
   */
  sendMessage: (conversationId: string, payload: SendMessageRequest) => {
    const http = createHttpClient();
    return http.post<SendMessageResponse>(`/api/chat/conversations/${conversationId}/message`, payload);
  },

  /**
   * get conversation details
   */
  getConversation: (conversationId: string) => {
    const http = createHttpClient();
    return http.get<GetConversationResponse>(`/api/chat/conversations/${conversationId}`);
  },
};


