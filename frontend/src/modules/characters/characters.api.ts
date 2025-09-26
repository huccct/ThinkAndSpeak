import { http } from '@/lib/http';
import type { BackendCharactersResponse } from './characters.types';

/**
 * get characters list
 */
export const charactersApi = {
  list: (q?: string) =>
    http.get<BackendCharactersResponse>('/api/chat/characters', {
      query: q ? { q } : undefined,
    }),
};


