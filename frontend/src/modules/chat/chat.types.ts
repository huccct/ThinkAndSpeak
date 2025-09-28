export type CreateConversationRequest = {
  characterId: string;
};

export type CreateConversationResponse = {
  code: number;
  message: string;
  data: {
    conversationId: string;
  };
};

export type SendMessageRequest = {
  text: string;
};

export type SendMessageResponse = {
  code: number;
  message: string;
  data: {
    reply: string;
    assistantMessageId: number;
  };
};

export type ConversationMessage = {
  id: string;
  sender: string;
  content: string;
  metadata: string | null;
  createdAt: number[]; 
};

export type GetConversationResponse = {
  code: number;
  message: string;
  data: {
    id: string;
    characterId: string;
    messages: ConversationMessage[];
  };
};

export type ConversationHistoryItem = {
  id: string;
  characterId: string;
  title: string | null;
  messages: ConversationMessage[] | null;
};

export type GetConversationHistoryResponse = {
  code: number;
  message: string;
  data: ConversationHistoryItem[];
};


