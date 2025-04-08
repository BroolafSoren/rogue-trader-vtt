import axios from 'axios';

export interface SpecialUse {
  Name: string;
  Usage: string;
}

export interface Skill {
  Name: string;
  Attributes: string;
  Type: 'Basic' | 'Advanced';
  Description: string;
  'Skill Use': string;
  'Special Use': SpecialUse;
  Category: string;
}

export const getSkills = async (): Promise<Skill[]> => {
  try {
    const response = await axios.get<Skill[]>('/api/skills');
    return response.data;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return []; // Return empty array rather than throwing
  }
};