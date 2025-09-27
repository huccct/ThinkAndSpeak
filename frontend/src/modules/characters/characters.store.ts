import { create } from 'zustand';
import { charactersApi } from './characters.api';
import type { CharacterItem } from './characters.types';
import { mapToItem } from './characters.types';

type State = {
  list: CharacterItem[];
  loading: boolean;
  error?: string;
  query: string;
};

type Actions = {
  setQuery: (q: string) => void;
  load: (q?: string) => Promise<void>;
  clear: () => void;
};

export const useCharactersStore = create<State & Actions>((set, get) => ({
  list: [],
  loading: false,
  error: undefined,
  query: '',

  setQuery: (q) => set({ query: q }),
  clear: () => set({ list: [], error: undefined }),

  load: async (q) => {
    const query = q ?? get().query ?? '';
    set({ loading: true, error: undefined });
    try {
      const res = await charactersApi.list(query);
      if (res.code !== 0) throw new Error(res.message || 'characters api error');
      const list = Array.isArray(res.data) ? res.data.map(mapToItem) : [];
      set({ list });
    } catch (e: any) {
      set({ error: e?.message || 'load characters failed' });
    } finally {
      set({ loading: false });
    }
  },
}));

// selectors
export const useCharacters = () => useCharactersStore(s => s.list);
export const useCharactersLoading = () => useCharactersStore(s => s.loading);
export const useCharactersError = () => useCharactersStore(s => s.error);
export const useCharactersQuery = () => useCharactersStore(s => s.query);
export const useCharactersLoad = () => useCharactersStore(s => s.load);
export const useCharactersSetQuery = () => useCharactersStore(s => s.setQuery);
export const useCharactersClear = () => useCharactersStore(s => s.clear);


