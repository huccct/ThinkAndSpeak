import { createHttpClient } from '@/lib/http';
import type { BackendCharactersResponse } from './characters.types';

/**
 * get characters list
 */
export const charactersApi = {
  list: (q?: string) => {
    const http = createHttpClient();
    return http.get<BackendCharactersResponse>('/api/chat/characters', {
      query: q ? { q } : undefined,
    });
  },
};


