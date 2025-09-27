export type CreateConversationRequest = {
  characterId: string;
  userId: string;
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


