import { create } from 'zustand';
import { Character, characterService } from '../services/characterService';

interface CharacterState {
  characters: Character[];
  selectedCharacterId: string | null;
  isLoading: boolean;
  error: string | null;
  loadCharacters: () => Promise<void>;
  selectCharacter: (characterId: string | null) => void;
  updateCharacter: (character: Character) => Promise<Character>;
}

// Add debugging to identify issues

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  selectedCharacterId: null,
  isLoading: false,
  error: null,
  
  loadCharacters: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log("Fetching characters from API...");
      const characters = await characterService.getCharacters();
      console.log("Characters loaded successfully:", characters);
      set({ characters, isLoading: false });
    } catch (error) {
      console.error("Error loading characters:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load characters', 
        isLoading: false,
        characters: [] // Set empty array as fallback
      });
    }
  },
  
  selectCharacter: (characterId) => {
    set({ selectedCharacterId: characterId });
  },
  
  updateCharacter: async (updatedCharacter) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Updating character:", updatedCharacter);
      const result = await characterService.updateCharacter(updatedCharacter);
      console.log("Server response:", result);
      
      // Update the character in the local state
      const characters = get().characters.map(character => 
        character.id === updatedCharacter.id ? result : character
      );
      
      set({ characters, isLoading: false });
      return result;
    } catch (error) {
      console.error("Error updating character:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update character', 
        isLoading: false 
      });
      throw error;
    }
  }
}));