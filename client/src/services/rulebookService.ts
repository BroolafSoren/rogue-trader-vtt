import axios from 'axios';

interface RulebookPage {
  pageIndex: number;
  text: string;
}

interface RulebookMetadata {
  filename: string;
  pageCount: number;
  firstPageIndex: number;
  lastPageIndex: number;
}

interface RulebookPagesResponse {
  filename: string;
  totalPages: number;
  pages: RulebookPage[];
}

// API base URL - adjust if your API is hosted on a different port
const API_URL = 'http://localhost:5000/api/rulebook'; // Adjust port as needed

export const rulebookService = {
  /**
   * Test the API connection
   */
  async testConnection(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/debug`);
      console.log('API debug info:', response.data);
      return response.data;
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  },

  /**
   * Get list of available rulebooks
   */
  async getRulebooks(): Promise<string[]> {
    try {
      // First test the connection
      await this.testConnection();
      
      const response = await axios.get(API_URL);
      console.log('Rulebook response:', response.data);
      
      // Handle the response properly
      if (Array.isArray(response.data)) {
        return response.data.map((item: {filename: string}) => item.filename);
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching rulebooks:', error);
      return [];
    }
  },

  /**
   * Get metadata about a specific rulebook
   */
  async getRulebookMetadata(filename: string): Promise<RulebookMetadata> {
    const response = await axios.get(`${API_URL}/${filename}/metadata`);
    console.log('Metadata response:', response.data);
    return response.data;
  },

  /**
   * Get a specific range of pages from a rulebook
   */
  async getRulebookPages(filename: string, startIndex: number, pageCount: number = 5): Promise<RulebookPagesResponse> {
    const response = await axios.get(`${API_URL}/${filename}/pages`, {
      params: {
        startIndex,
        count: pageCount
      }
    });
    console.log('Pages response:', response.data);
    return response.data;
  }
};

export type { RulebookPage, RulebookMetadata, RulebookPagesResponse };