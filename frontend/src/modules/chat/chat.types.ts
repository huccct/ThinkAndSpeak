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


