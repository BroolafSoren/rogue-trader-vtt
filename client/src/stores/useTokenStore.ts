import { create } from 'zustand';

interface Token {
  id: string;
  x: number;
  y: number;
  color: string;
  waypoints: { x: number; y: number }[];
}

interface TokenStore {
  tokens: Token[];
  selectedToken: string | null;
  localTokenPos: { id: string; x: number; y: number } | null;
  setTokens: (tokens: Token[]) => void;
  addToken: (token: Token) => void;
  selectToken: (id: string) => void;
  addWaypoint: (id: string, waypoint: { x: number; y: number }) => void;
  removeWaypoints: (id: string) => void;
  setLocalTokenPos: (pos: { id: string; x: number; y: number } | null) => void;
  updateTokenPosition: (id: string, x: number, y: number) => void; // Add this function
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  selectedToken: null,
  localTokenPos: null,
  setTokens: (tokens) => set({ tokens }),
  addToken: (token) => set((state) => ({ tokens: [...state.tokens, token] })),
  selectToken: (id) => set({ selectedToken: id }),
  addWaypoint: (id, waypoint) => set((state) => ({
    tokens: state.tokens.map((token) =>
      token.id === id ? { ...token, waypoints: [...token.waypoints, waypoint] } : token
    ),
  })),
  removeWaypoints: (id) => set((state) => ({
    tokens: state.tokens.map((token) =>
      token.id === id ? { ...token, waypoints: [] } : token
    ),
  })),
  setLocalTokenPos: (pos) => set({ localTokenPos: pos }),
  updateTokenPosition: (id, x, y) => set((state) => ({
    tokens: state.tokens.map((token) =>
      token.id === id ? { ...token, x, y } : token
    ),
  })),
}));