export type BackendCharacter = {
  id: string;
  name: string;
  tags: string; // comma separated
  persona: string;
  portraitUrl?: string;
};

export type BackendCharactersResponse = {
  code: number;
  message: string;
  data: BackendCharacter[];
};

// UI model
export type CharacterItem = {
  id: string;
  name: string;
  topics: string[];
  persona: string;
  avatar?: string;
};

export function mapToItem(row: BackendCharacter): CharacterItem {
  return {
    id: row.id,
    name: row.name,
    topics: row.tags ? row.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    persona: row.persona,
    avatar: row.portraitUrl,
  };
}


