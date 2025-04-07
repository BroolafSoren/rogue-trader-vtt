import { useState, useEffect } from 'react';
import { useCharacterStore } from '../stores/useCharacterStore';
import { Character, CharacterBackground } from '../services/characterService';
import '../styles/CharacterSheet.css';

interface CharacterSheetProps {
  characterId: string;
}

export default function CharacterSheet({ characterId }: CharacterSheetProps) {
  const { characters, updateCharacter } = useCharacterStore();
  const [character, setCharacter] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState('stats');
  
  // New state for editing
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  
  
  useEffect(() => {
    const foundCharacter = characters.find(c => c.id === characterId);
    if (foundCharacter) {
      // Clone to avoid reference issues
      const characterClone = JSON.parse(JSON.stringify(foundCharacter));
      
      // Ensure background exists
      if (!characterClone.background) {
        console.warn("Character loaded without background data, creating empty object");
        characterClone.background = {
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
      
      // Log for debugging
      console.log("Character loaded with background:", characterClone.background);
      
      // Set state
      setCharacter(characterClone);
      setEditedDescription(characterClone.background?.description || '');
      setEditedNotes(characterClone.background?.notes || '');
    }
  }, [characterId, characters]);
  
  if (!character) {
    return <div className="character-sheet-loading">Loading character...</div>;
  }
  
  // Handle description save
  const handleSaveDescription = () => {
    if (!character) return;
    
    // Create a complete background object that preserves all fields
    const updatedBackground: CharacterBackground = {
      ...character.background || {
        homeworld: '',
        birthright: '',
        lureOfVoid: '',
        trialsAndTravails: '',
        motivation: '',
        lineage: '',
        notes: ''
      },
      description: editedDescription
    };
    
    const updatedCharacter = {
      ...character,
      background: updatedBackground
    };
    
    console.log("Saving updated character with background:", updatedCharacter.background);
    updateCharacter(updatedCharacter);
    setIsEditingDescription(false);
  };
  
  // Handle notes save
  const handleSaveNotes = () => {
    if (!character) return;
    
    // Create a complete background object that preserves all fields
    const updatedBackground: CharacterBackground = {
      ...character.background || {
        homeworld: '',
        birthright: '',
        lureOfVoid: '',
        trialsAndTravails: '',
        motivation: '',
        lineage: '',
        description: ''
      },
      notes: editedNotes
    };
    
    const updatedCharacter = {
      ...character,
      background: updatedBackground
    };
    
    console.log("Saving updated character notes:", updatedCharacter.background);
    updateCharacter(updatedCharacter);
    setIsEditingNotes(false);
  };
  
  // Render the Stats tab content
  const renderStatsTab = () => (
    <>
      <div className="character-stats">
        <h3>Characteristics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">WS</div>
            <div className="stat-value">{character.characteristics.ws.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">BS</div>
            <div className="stat-value">{character.characteristics.bs.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">S</div>
            <div className="stat-value">{character.characteristics.s.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">T</div>
            <div className="stat-value">{character.characteristics.t.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Ag</div>
            <div className="stat-value">{character.characteristics.ag.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Int</div>
            <div className="stat-value">{character.characteristics.int.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Per</div>
            <div className="stat-value">{character.characteristics.per.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">WP</div>
            <div className="stat-value">{character.characteristics.wp.value}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Fel</div>
            <div className="stat-value">{character.characteristics.fel.value}</div>
          </div>
        </div>
      </div>
      
      <div className="character-skills">
        <h3>Skills</h3>
        <div className="skills-list">
          {Object.entries(character.skills).map(([name, skill]) => (
            <div key={name} className="skill-item">
              <div className="skill-name">{name} (+{skill.advances * 10})</div>
              <div className="skill-value">
                {character.characteristics[skill.characteristic as keyof typeof character.characteristics].value + skill.advances * 10}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="character-talents">
        <h3>Talents</h3>
        <div className="talents-list">
          {character.talents.map((talent) => (
            <div key={talent.id} className="talent-item">
              <div className="talent-name">{talent.name}</div>
              <div className="talent-desc">{talent.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="character-health">
        <h3>Wounds</h3>
        <div className="wounds-container">
          <div className="wounds-bar">
            <div 
              className="wounds-current" 
              style={{width: `${(character.wounds.current / character.wounds.total) * 100}%`}}
            />
          </div>
          <div className="wounds-text">
            {character.wounds.current} / {character.wounds.total}
          </div>
        </div>
      </div>
      
      <div className="character-experience">
        <h3>Experience</h3>
        <div className="exp-container">
          <div className="exp-total">
            <div className="exp-label">Total</div>
            <div className="exp-value">{character.experiencePoints.total}</div>
          </div>
          <div className="exp-spent">
            <div className="exp-label">Spent</div>
            <div className="exp-value">{character.experiencePoints.spent}</div>
          </div>
          <div className="exp-available">
            <div className="exp-label">Available</div>
            <div className="exp-value">{character.experiencePoints.total - character.experiencePoints.spent}</div>
          </div>
        </div>
      </div>
    </>
  );
  
  // Render the Background tab content with editing capabilities
  const renderBackgroundTab = () => (
    <div className="character-background">
      <div className="background-section">
        <h3>Origin Path</h3>
        <div className="origin-paths">
          <div className="origin-item">
            <div className="origin-label">Homeworld</div>
            <div className="origin-value">{character.background?.homeworld || 'Unknown'}</div>
          </div>
          <div className="origin-item">
            <div className="origin-label">Birthright</div>
            <div className="origin-value">{character.background?.birthright || 'Unknown'}</div>
          </div>
          <div className="origin-item">
            <div className="origin-label">Lure of the Void</div>
            <div className="origin-value">{character.background?.lureOfVoid || 'Unknown'}</div>
          </div>
          <div className="origin-item">
            <div className="origin-label">Trials and Travails</div>
            <div className="origin-value">{character.background?.trialsAndTravails || 'Unknown'}</div>
          </div>
          <div className="origin-item">
            <div className="origin-label">Motivation</div>
            <div className="origin-value">{character.background?.motivation || 'Unknown'}</div>
          </div>
          <div className="origin-item">
            <div className="origin-label">Lineage</div>
            <div className="origin-value">{character.background?.lineage || 'Unknown'}</div>
          </div>
        </div>
      </div>
      
      <div className="background-section">
        <div className="section-header">
          <h3>Character Description</h3>
          <button 
            className="edit-button"
            onClick={() => setIsEditingDescription(!isEditingDescription)}
          >
            {isEditingDescription ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingDescription ? (
          <div className="edit-content">
            <textarea 
              value={editedDescription} 
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={6}
              className="edit-textarea"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSaveDescription}>Save</button>
            </div>
          </div>
        ) : (
          <div className="description-content">
            <p>{character.background?.description || 'No description available.'}</p>
          </div>
        )}
      </div>
      
      <div className="background-section">
        <div className="section-header">
          <h3>Notes</h3>
          <button 
            className="edit-button"
            onClick={() => setIsEditingNotes(!isEditingNotes)}
          >
            {isEditingNotes ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingNotes ? (
          <div className="edit-content">
            <textarea 
              value={editedNotes} 
              onChange={(e) => setEditedNotes(e.target.value)}
              rows={6}
              className="edit-textarea"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSaveNotes}>Save</button>
            </div>
          </div>
        ) : (
          <div className="notes-content">
            <p>{character.background?.notes || 'No notes available.'}</p>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render the Combat tab content (placeholder)
  const renderCombatTab = () => (
    <div className="character-combat">
      <h3>Combat Information</h3>
      <p>Combat details coming soon...</p>
    </div>
  );
  
  return (
    <div className="character-sheet">
      <div className="character-header">
        <div className="header-main">
          <h2>{character.name}</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
            <button 
              className={`tab-button ${activeTab === 'background' ? 'active' : ''}`}
              onClick={() => setActiveTab('background')}
            >
              Background
            </button>
            <button 
              className={`tab-button ${activeTab === 'combat' ? 'active' : ''}`}
              onClick={() => setActiveTab('combat')}
            >
              Combat
            </button>
          </div>
        </div>
        <div className="character-subheader">
          <span>{character.career}</span>
          <span>Rank: {character.rank}</span>
          <span>Home World: {character.background?.homeworld || 'Unknown'}</span>
        </div>
      </div>
      
      <div className="character-content">
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'background' && renderBackgroundTab()}
        {activeTab === 'combat' && renderCombatTab()}
      </div>
    </div>
  );
}