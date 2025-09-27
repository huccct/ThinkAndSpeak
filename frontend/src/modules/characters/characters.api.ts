import { createHttpClient } from '@/lib/http';
import type { BackendCharactersResponse } from './characters.types';

/**
 * get characters list
 */
export const createCharactersApi = (getToken: () => string | null) => {
  const http = createHttpClient({ getToken });
  
  return {
    list: (q?: string) =>
      http.get<BackendCharactersResponse>('/api/chat/characters', {
        query: q ? { q } : undefined,
      }),
  };
};


