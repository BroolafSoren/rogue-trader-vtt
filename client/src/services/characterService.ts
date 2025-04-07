import axios from 'axios';

export interface Characteristic {
  value: number;
  advances: number;
  simpleAdvanceCost: number;
  intermediateAdvanceCost: number;
  trainedAdvanceCost: number;
}

export interface Skill {
  trained: boolean;
  advances: number;
  characteristic: string;
  specializations: string[];
}

export interface Talent {
  id: string;
  name: string;
  description: string;
}

// Interface for character background
export interface CharacterBackground {
  homeworld: string;
  birthright: string;
  lureOfVoid: string;
  trialsAndTravails: string;
  motivation: string;
  lineage: string;
  description: string;
  notes: string;
}

export interface Character {
  id: string;
  name: string;
  career: string;
  rank: string;
  characteristics: {
    ws: Characteristic;
    bs: Characteristic;
    s: Characteristic;
    t: Characteristic;
    ag: Characteristic;
    int: Characteristic;
    per: Characteristic;
    wp: Characteristic;
    fel: Characteristic;
  };
  skills: Record<string, Skill>;
  talents: Talent[];
  wounds: {
    total: number;
    current: number;
  };
  experiencePoints: {
    total: number;
    spent: number;
  };
  background?: CharacterBackground;
}

// In Docker: Use relative URL to leverage nginx proxy
// Not in Docker: Use full URL for direct access
const API_URL = '/api';  // Let nginx handle the proxying

console.log('Using API URL:', API_URL);

// In the transformResponseData function, ensure we handle migration of old data
const transformResponseData = (data: any): any => {
  // First check if we have a PascalCase 'Background' property
  if (data.Background && !data.background) {
    data.background = data.Background;
    delete data.Background; // Clean up
  }
  
  // Initialize background if it doesn't exist
  if (!data.background) {
    data.background = {
      homeworld: '',
      birthright: '',
      lureOfVoid: '',
      trialsAndTravails: '',
      motivation: '',
      lineage: '',
      description: '',
      notes: ''
    };
  }
  
  // Handle case variations in background properties
  if (data.background) {
    const background = {
      homeworld: data.background.Homeworld || data.background.homeworld || '',
      birthright: data.background.Birthright || data.background.birthright || '',
      lureOfVoid: data.background.LureOfVoid || data.background.lureOfVoid || '',
      trialsAndTravails: data.background.TrialsAndTravails || data.background.trialsAndTravails || '',
      motivation: data.background.Motivation || data.background.motivation || '',
      lineage: data.background.Lineage || data.background.lineage || '',
      description: data.background.Description || data.background.description || '',
      notes: data.background.Notes || data.background.notes || ''
    };
    
    data.background = background;
  }
  
  return data;
};

export const characterService = {
  async getCharacters(): Promise<Character[]> {
    try {
      const response = await axios.get(`${API_URL}/characters`);
      console.log('API response:', response);
      // Add error handling for the case when response.data is not an array
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        return [];
      }
      return response.data.map(transformResponseData);
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  },

  async getCharacterById(characterId: string): Promise<Character> {
    const response = await axios.get(`${API_URL}/characters/${characterId}`);
    console.log('Raw character data by ID:', response.data);
    return transformResponseData(response.data);
  },

  async updateCharacter(character: Character): Promise<Character> {
    console.log('Sending update to server:', character);
    const response = await axios.put(`${API_URL}/characters/${character.id}`, character);
    return transformResponseData(response.data);
  }
};