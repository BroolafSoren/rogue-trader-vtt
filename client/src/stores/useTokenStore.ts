import { create } from 'zustand';

interface Token {
  id: string;
  x: number;
  y: number;
  color: string;
  waypoints?: { x: number; y: number }[];
}

interface TokenStore {
  tokens: Token[];
  selectedToken: string | null;
  setTokens: (tokens: Token[]) => void;
  selectToken: (id: string) => void;
  addWaypoint: (tokenId: string, position: { x: number; y: number }) => void;
  addToken: (token: Token) => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  selectedToken: null,
  setTokens: (tokens) => set({ tokens }),
  selectToken: (id) => set({ selectedToken: id }),
  addWaypoint: (tokenId, position) => set((state) => ({
    tokens: state.tokens.map((token) => 
      token.id === tokenId 
        ? { ...token, waypoints: [...(token.waypoints || []), position] }
        : token
    ),
  })),
  addToken: (token) => set((state) => ({
    tokens: [...state.tokens, token]
  })),
}));