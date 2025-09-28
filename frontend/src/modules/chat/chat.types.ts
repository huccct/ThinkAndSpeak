export type CreateConversationRequest = {
  characterId: number;
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
  persona: string;
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


