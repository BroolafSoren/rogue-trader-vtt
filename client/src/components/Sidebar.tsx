import { useState, useEffect } from 'react';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useWindowStore } from '../stores/useWindowStore';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const { characters, loadCharacters, error } = useCharacterStore();
  const { openWindow } = useWindowStore();
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);
  
  const handleCharacterClick = (characterId: string) => {
    openWindow({
      id: `character-${characterId}`,
      type: 'character-sheet',
      title: characters.find(c => c.id === characterId)?.name || 'Character',
      contentProps: { characterId }
    });
  };
  
  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '◀' : '▶'}
      </div>
      
      {isExpanded && (
        <>
          <div className="sidebar-header">
            <h3>Characters</h3>
          </div>
          
          {error && (
            <div className="sidebar-error">
              {error}
            </div>
          )}
          
          <div className="character-list">
            {characters.map(character => (
              <div 
                key={character.id}
                className="character-list-item"
                onClick={() => handleCharacterClick(character.id)}
              >
                <div className="character-name">{character.name}</div>
                <div className="character-career">{character.career}</div>
              </div>
            ))}
            
            {characters.length === 0 && !error && (
              <div className="no-characters">
                No characters available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}