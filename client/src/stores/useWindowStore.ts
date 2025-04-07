import { create } from 'zustand';

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  type: string;
  title: string;
  isOpen: boolean;
  isPopout: boolean;
  position: WindowPosition;
  contentProps: Record<string, any>;
}

interface WindowsState {
  windows: WindowState[];
  openWindow: (window: Omit<WindowState, 'isOpen' | 'isPopout' | 'position'> & Partial<WindowState>) => void;
  closeWindow: (id: string) => void;
  updatePosition: (id: string, position: Partial<WindowPosition>) => void;
}

export const useWindowStore = create<WindowsState>((set) => ({
  windows: [],

  openWindow: (window) => set((state) => {
    const existingWindow = state.windows.find(w => w.id === window.id);
    
    if (existingWindow) {
      // Update existing window
      return {
        windows: state.windows.map(w => 
          w.id === window.id 
            ? { ...w, isOpen: true, contentProps: { ...w.contentProps, ...window.contentProps } }
            : w
        )
      };
    } else {
      // Create new window with default values
      const newWindow: WindowState = {
        ...window,
        isOpen: true,
        isPopout: false,
        position: window.position || {
          x: 100,
          y: 100,
          width: 700,
          height: 500
        }
      };
      return {
        windows: [...state.windows, newWindow]
      };
    }
  }),
  
  closeWindow: (id) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, isOpen: false } : w
    )
  })),
  
  updatePosition: (id, position) => set((state) => ({
    windows: state.windows.map(w =>
      w.id === id ? { ...w, position: { ...w.position, ...position } } : w
    )
  })),
}));