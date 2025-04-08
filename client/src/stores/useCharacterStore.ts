import { create } from 'zustand';
import axios from 'axios';
import { connection } from '../services/connectionService';

interface Skill {
  Trained: boolean;
  Advances: number;
  Characteristic: string;
  Specializations: string[];
}

interface Character {
  id: string;
  name: string;
  career: string;
  rank: string;
  characteristics: Record<string, { value: number }>;
  skills: Record<string, Skill>;
  talents: Array<{ id: string; name: string; description: string }>;
  wounds: { current: number; total: number };
  experiencePoints: { total: number; spent: number };
  background?: {
    homeworld: string;
    birthright: string;
    lureOfVoid: string;
    trialsAndTravails: string;
    motivation: string;
    lineage: string;
    description: string;
    notes: string;
  };
}

interface CharacterStore {
  characters: Character[];
  loading: boolean;
  error: string | null;
  fetchCharacters: () => Promise<void>;
  loadCharacters: () => Promise<void>; // Add this alias for consistency
  getCharacter: (id: string) => Promise<Character | undefined>;
  updateCharacter: (character: Character) => Promise<void>;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  loading: false,
  error: null,

  fetchCharacters: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get<Character[]>('/api/characters');
      set({ characters: response.data, loading: false });
      console.log('Characters loaded successfully:', response.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
      set({ loading: false, error: 'Failed to load characters' });
    }
  },

  // Add alias method for fetchCharacters to maintain API compatibility
  loadCharacters: async () => {
    return get().fetchCharacters();
  },

  getCharacter: async (id: string) => {
    const { characters, fetchCharacters } = get();
    let character = characters.find(c => c.id === id);
    
    if (!character) {
      await fetchCharacters();
      character = get().characters.find(c => c.id === id);
    }
    
    return character;
  },
  
  updateCharacter: async (character: Character) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating character:', character);
      const response = await axios.put(`/api/characters/${character.id}`, character);
      
      set(state => ({
        characters: state.characters.map(c => 
          c.id === character.id ? response.data : c
        ),
        loading: false
      }));
      
      if (connection.state === 'Connected') {
        await connection.invoke('CharacterUpdated', character.id);
      }
      
      console.log('Character updated successfully');
    } catch (error) {
      console.error('Error updating character:', error);
      set({ loading: false, error: 'Failed to update character' });
    }
  }
}));