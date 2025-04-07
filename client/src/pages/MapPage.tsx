import { useEffect } from 'react';
import MapCanvas from '../components/MapCanvas';
import MovementControls from '../components/MovementControls';
import Sidebar from '../components/Sidebar';
// Import the new component
import FloatingWindow from '../components/FloatingWindow';
import CharacterSheet from '../components/CharacterSheet';
import { useTokenStore } from '../stores/useTokenStore';
import { useWindowStore } from '../stores/useWindowStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { v4 as uuidv4 } from 'uuid';
import { connection } from '../services/connectionService';
import '../styles/MapPage.css';

export default function MapPage() {
  const { tokens, addToken } = useTokenStore();
  const { windows } = useWindowStore();
  
  // Load characters when the component mounts
  useEffect(() => {
    useCharacterStore.getState().loadCharacters();
  }, []);
  
  const handleCreateToken = () => {
    const newToken = {
      id: uuidv4(),
      x: (50 * 20) / 2,
      y: (50 * 20) / 2,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      waypoints: [],
    };

    addToken(newToken);
    connection.invoke('CreateToken', newToken);
  };

  // Window content mapping
  // Define interfaces for window types
  interface WindowState {
    id: string;
    type: string;
    isOpen: boolean;
    title?: string;
    contentProps: Record<string, any>;
  }
  
  interface CharacterSheetWindow extends WindowState {
    type: 'character-sheet';
    contentProps: {
      characterId: string;
    };
  }
  
  // Union type for all possible window types
  type AppWindow = CharacterSheetWindow | WindowState;

  const renderWindowContent = (window: AppWindow) => {
    switch (window.type) {
      case 'character-sheet':
        return <CharacterSheet characterId={window.contentProps.characterId} />;
      default:
        return <div>Unknown window type</div>;
    }
  };

  return (
    <div className="map-page">
      <Sidebar />
      
      <div className="map-content">
        <h2>Map View</h2>
        <button onClick={handleCreateToken}>Create Token</button>
        <MovementControls />
        <MapCanvas />
        <div>Tokens: {tokens.length}</div>
      </div>
      
      {/* Render all open windows with the new FloatingWindow component */}
      {windows
        .filter(window => window.isOpen)
        .map(window => (
          <FloatingWindow key={window.id} window={window}>
            {renderWindowContent(window)}
          </FloatingWindow>
        ))}
    </div>
  );
}