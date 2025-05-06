import axios from 'axios';

// Keep DTO interfaces (they should mostly match the backend DTOs)
interface RulebookPage {
  pageIndex: number;
  text: string;
}

// Updated to match backend RulebookInfo DTO
interface RulebookInfo {
  alias: string;       // e.g., "rogue-trader-core-rulebook"
  displayName: string; // e.g., "Rogue Trader - Core-Rulebook"
}

interface RulebookMetadata {
  alias: string;
  displayName: string;
  pageCount: number;
  firstPageIndex: number;
  lastPageIndex: number;
}

interface RulebookPagesResponse {
  alias: string;
  displayName: string;
  totalPages: number;
  pages: RulebookPage[];
}

const API_URL = 'http://localhost:5000/api/rulebook';

export const rulebookService = {
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
   * Get list of available rulebooks (returns RulebookInfo objects)
   */
  async getRulebooks(): Promise<RulebookInfo[]> { // Return type changed
    try {
      await this.testConnection(); // Optional: Keep test before first real call

      const response = await axios.get<RulebookInfo[]>(API_URL); // Expect an array of RulebookInfo
      console.log('Rulebook list response:', response.data);

      if (Array.isArray(response.data)) {
        // Data should already be in the correct format
        return response.data;
      } else {
        console.warn('Unexpected rulebook list response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching rulebooks:', error);
      return [];
    }
  },

  /**
   * Get metadata about a specific rulebook using its alias
   */
  async getRulebookMetadata(alias: string): Promise<RulebookMetadata | null> { // Parameter changed, added null possibility
    try {
        const response = await axios.get<RulebookMetadata>(`${API_URL}/${alias}/metadata`);
        console.log('Metadata response:', response.data);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
             console.warn(`Metadata not found for alias: ${alias}`);
             return null; // Handle Not Found gracefully
        }
        console.error(`Error fetching metadata for alias ${alias}:`, error);
        throw error; // Re-throw other errors
    }
  },

  /**
   * Get a specific range of pages from a rulebook using its alias
   */
  async getRulebookPages(alias: string, startIndex: number, pageCount: number = 5): Promise<RulebookPagesResponse | null> { // Parameter changed, added null possibility
     try {
        const response = await axios.get<RulebookPagesResponse>(`${API_URL}/${alias}/pages`, {
          params: {
            startIndex,
            count: pageCount
          }
        });
        console.log(`Pages response for alias ${alias}:`, response.data);
        return response.data;
     } catch (error: any) {
         if (error.response && error.response.status === 404) {
             console.warn(`Pages not found for alias: ${alias}`);
             return null; // Handle Not Found gracefully
         }
         console.error(`Error fetching pages for alias ${alias}:`, error);
         throw error; // Re-throw other errors
     }
  }
};

// Export updated types
export type { RulebookPage, RulebookInfo, RulebookMetadata, RulebookPagesResponse };