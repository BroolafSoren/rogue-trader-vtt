import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '../stores/useCharacterStore';
import { getSkills, Skill } from '../services/skillsService';
import '../styles/CharacterSheet.css';

interface CharacterSheetProps {
  characterId: string;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ characterId }) => {
  const { characters } = useCharacterStore();
  const [activeTab, setActiveTab] = useState('stats');
  const [character, setCharacter] = useState<any | null>(null);
  const [basicSkills, setBasicSkills] = useState<Skill[]>([]);
  const [advancedSkills, setAdvancedSkills] = useState<Skill[]>([]);

  // Load character from store
  useEffect(() => {
    const foundCharacter = characters.find((c) => c.id === characterId);
    if (foundCharacter) {
      setCharacter(foundCharacter);
    }
  }, [characterId, characters]);

  // Fetch skills from API
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await getSkills();
        
        // Split skills by type
        setBasicSkills(skills.filter(skill => skill.Type === 'Basic'));
        setAdvancedSkills(skills.filter(skill => skill.Type === 'Advanced'));
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    };
    
    loadSkills();
  }, []);

  if (!character) {
    return <div className="loading">Loading character...</div>;
  }

  // Fix the getSkillTraining function to properly handle capitalization
  const getSkillTraining = (skillName: string) => {
    if (!character.skills) return { trained: false, advances: 0 };
    
    // Find the skill in character skills (case-insensitive)
    const skillEntry = Object.entries(character.skills).find(
      ([key]) => key.toLowerCase() === skillName.toLowerCase()
    );
    
    if (!skillEntry) return { trained: false, advances: 0 };
    
    const [_, value] = skillEntry as [string, any];
        return {
      trained: value.trained !== undefined ? value.trained : (value.Trained || false),
      advances: value.advances !== undefined ? value.advances : (value.Advances || 0)
    };
  };

  // Map skill attribute to character characteristic
  const mapAttributeToCharacteristic = (attribute: string | string[]) => {
    if (!attribute) return '';
    
    // Handle array attributes (choose first one by default)
    const primaryAttribute = Array.isArray(attribute) ? attribute[0] : attribute;
    
    // Map from skill attributes to character characteristics
    const attributeMap: {[key: string]: string} = {
      'Strength': 's', 
      'Toughness': 't',
      'Agility': 'ag',
      'Intelligence': 'int',
      'Perception': 'per',
      'Willpower': 'wp',
      'Fellowship': 'fel',
      // Abbreviated forms
      'S': 's',
      'T': 't',
      'Ag': 'ag',
      'Int': 'int',
      'Per': 'per',
      'WP': 'wp',
      'Fel': 'fel'
    };
    
    return attributeMap[primaryAttribute] || primaryAttribute.toLowerCase();
  };

  // Get characteristic value from character data
  const getCharacteristicValue = (characteristicKey: string) => {
    if (!characteristicKey || !character.characteristics) return 0;
    
    const char = character.characteristics[characteristicKey.toLowerCase()];
    return char ? char.value : 0;
  };

  // Calculate skill talent modifiers by checking all talents that might affect the skill
  const getSkillTalentModifiers = (skillName: string) => {
    if (!character.talents || !character.talents.length) return 0;
    
    let modifier = 0;
    
    // Check each talent to see if it modifies this skill
    interface Talent {
      id: string;
      name: string;
      description: string;
      // Add other talent properties if needed
    }

    (character.talents as Talent[]).forEach((talent: Talent) => {
      // Examples of talent effects (these need to match your talent descriptions)
      if (talent.name === "Peer (Imperium)" && 
       (skillName === "Charm" || skillName === "Command" || skillName === "Commerce") && 
        skillName.toLowerCase().includes("imperium")) {
      modifier += 10; // +10 to Fellowship Tests with Imperial citizens
      }
      
      // Add more talent effect checks here as needed
      // For example: Technical Knock for Tech-Use, etc.
    });
    
    return modifier;
  };

  // Simplified skill rendering without reliance on skill.characteristic
  const renderSkillRow = (skill: Skill) => {
    // Get training status
    const skillTraining = getSkillTraining(skill.Name);
    
    // We'll always use the skill.Attributes directly instead of skill.characteristic
    const charKey = mapAttributeToCharacteristic(skill.Attributes);
    const charValue = getCharacteristicValue(charKey);
    
    // Calculate base value according to rules
    let baseValue = 0;
    
    if (skillTraining.trained) {
      // Trained skills use full characteristic value
      baseValue = charValue;
    } else {
      // Untrained skills follow different rules
      if (skill.Type === 'Basic') {
        // Untrained basic skills use half characteristic value
        baseValue = Math.floor(charValue / 2);
      } else {
        // Untrained advanced skills can't be used (value 0)
        baseValue = 0;
      }
    }
    
    // Calculate modifiers
    const advanceBonus = skillTraining.trained ? skillTraining.advances * 10 : 0;
    const talentModifier = getSkillTalentModifiers(skill.Name);
    
    // Final skill value
    const totalValue = baseValue + advanceBonus + talentModifier;
    
    // Determine display for training status
    let trainingDisplay;
    if (skillTraining.trained) {
      // Show +10/+20 for advances
      if (skillTraining.advances > 0) {
        trainingDisplay = `+${skillTraining.advances * 10}`;
      } else {
        trainingDisplay = 'Trained';
      }
      
      // Add talent modifiers if present
      if (talentModifier !== 0) {
        trainingDisplay += ` (${talentModifier > 0 ? '+' : ''}${talentModifier})`;
      }
    } else {
      // Show 'Half' for untrained basic skills, 'Untrained' for advanced
      trainingDisplay = skill.Type === 'Basic' ? 'Basic' : 'Untrained';
    }
    
    return (
      <div key={skill.Name} 
           className={`skill-row ${skillTraining.trained ? 'trained' : 'untrained'} ${skill.Type.toLowerCase()}`}
           title={`${skill.Description}${skill['Skill Use'] ? '\n\nUse: ' + skill['Skill Use'] : ''}`}
      >
        <div className="skill-name">
          {skill.Name}
          <span className="skill-attribute">({skill.Attributes})</span>
        </div>
        <div className="skill-value">
          <span className="skill-status">{trainingDisplay}</span>
          <span className="skill-total">{totalValue}</span>
        </div>
      </div>
    );
  };

  const renderStatsTab = () => (
    <div className="stats-tab">
      <div className="characteristics-section">
        <h3>Characteristics</h3>
        <div className="characteristics-grid">
          {Object.entries(character.characteristics || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="characteristic-item">
              <div className="characteristic-label">{key.toUpperCase()}</div>
              <div className="characteristic-value">{value.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h3>Skills</h3>
        <div className="skills-columns">
          <div className="skills-column">
            <h4>Basic Skills</h4>
            <div className="skills-list">
              {basicSkills.map(skill => renderSkillRow(skill))}
            </div>
          </div>
          <div className="skills-column">
            <h4>Advanced Skills</h4>
            <div className="skills-list">
              {advancedSkills.map(skill => renderSkillRow(skill))}
            </div>
          </div>
        </div>
      </div>

      <div className="talents-section">
        <h3>Talents</h3>
        <div className="talents-list">
          {(character.talents || []).map((talent: any) => (
            <div key={talent.id} className="talent-item">
              <div className="talent-name">{talent.name}</div>
              <div className="talent-description">{talent.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="experience-section">
        <h3>Experience</h3>
        <div className="experience-points">
          <div>Total: {character.experiencePoints?.total || 0}</div>
          <div>Spent: {character.experiencePoints?.spent || 0}</div>
          <div>Available: {(character.experiencePoints?.total || 0) - (character.experiencePoints?.spent || 0)}</div>
        </div>
      </div>
    </div>
  );

  const renderCombatTab = () => (
    <div className="combat-tab">
      {/* Moved Wounds section to Combat tab */}
      <div className="wounds-section">
        <h3>Wounds</h3>
        <div className="wounds-container">
          <div className="wounds-bar">
            <div 
              className="wounds-current" 
              style={{width: `${(character.wounds?.current / character.wounds?.total) * 100}%`}}
            ></div>
          </div>
          <div className="wounds-text">
            {character.wounds?.current || 0} / {character.wounds?.total || 0}
          </div>
        </div>
      </div>
      
      <div className="combat-info">
        <h3>Combat Information</h3>
        <p>Additional combat details will be displayed here.</p>
      </div>
    </div>
  );

  const renderBackgroundTab = () => (
    <div className="background-tab">
      <div className="origin-details">
        <h3>Origin Details</h3>
        <div className="background-fields">
          <div className="background-field">
            <label>Homeworld:</label>
            <span>{character.background?.homeworld || 'Unknown'}</span>
          </div>
          <div className="background-field">
            <label>Birthright:</label>
            <span>{character.background?.birthright || 'Unknown'}</span>
          </div>
          <div className="background-field">
            <label>Lure of the Void:</label>
            <span>{character.background?.lureOfVoid || 'Unknown'}</span>
          </div>
          <div className="background-field">
            <label>Trials & Travails:</label>
            <span>{character.background?.trialsAndTravails || 'Unknown'}</span>
          </div>
          <div className="background-field">
            <label>Motivation:</label>
            <span>{character.background?.motivation || 'Unknown'}</span>
          </div>
          <div className="background-field">
            <label>Lineage:</label>
            <span>{character.background?.lineage || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="background-description">
        <h3>Background</h3>
        <p>{character.background?.description || 'No background information available.'}</p>
      </div>

      <div className="background-notes">
        <h3>Notes</h3>
        <p>{character.background?.notes || 'No notes available.'}</p>
      </div>
    </div>
  );

  return (
    <div className="character-sheet">
      <div className="character-header">
        <h2>{character.name}</h2>
        <div className="character-subheader">
          <span>{character.career} - {character.rank}</span>
        </div>
      </div>

      <div className="character-navigation">
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button 
          className={activeTab === 'combat' ? 'active' : ''} 
          onClick={() => setActiveTab('combat')}
        >
          Combat
        </button>
        <button 
          className={activeTab === 'background' ? 'active' : ''} 
          onClick={() => setActiveTab('background')}
        >
          Background
        </button>
      </div>

      <div className="character-content">
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'combat' && renderCombatTab()}
        {activeTab === 'background' && renderBackgroundTab()}
      </div>
    </div>
  );
};

export default CharacterSheet;