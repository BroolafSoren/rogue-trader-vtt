using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace src.models
{
    public interface ICharacterRepository
    {
        Task<List<Character>> GetAllCharactersAsync();
        Task<Character> GetCharacterByIdAsync(string id);
        Task<Character> CreateCharacterAsync(Character character);
        Task<Character> UpdateCharacterAsync(Character character);
        Task<bool> DeleteCharacterAsync(string id);
    }

    public class JsonCharacterRepository : ICharacterRepository
    {
        private readonly string _dataFilePath;
        private readonly ILogger<JsonCharacterRepository> _logger;
        private List<Character> _characters;

        public JsonCharacterRepository(ILogger<JsonCharacterRepository> logger)
        {
            _logger = logger;
            
            // The data file will be in the server/data directory
            string dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data");
            
            // Create the directory if it doesn't exist
            if (!Directory.Exists(dataPath))
            {
                Directory.CreateDirectory(dataPath);
            }
            
            _dataFilePath = Path.Combine(dataPath, "characters.json");
            
            // Load or initialize characters
            _characters = LoadCharactersFromFile().GetAwaiter().GetResult();
            
            // If no characters exist yet, add some sample data
            if (_characters.Count == 0)
            {
                _characters.AddRange(CreateSampleCharacters());
                SaveCharactersToFile().GetAwaiter().GetResult();
            }
        }

        private async Task<List<Character>> LoadCharactersFromFile()
        {
            try
            {
                if (File.Exists(_dataFilePath))
                {
                    string json = await File.ReadAllTextAsync(_dataFilePath);
                    return JsonSerializer.Deserialize<List<Character>>(json) ?? new List<Character>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading characters from file");
            }
            
            return new List<Character>();
        }

        private async Task SaveCharactersToFile()
        {
            try
            {
                string json = JsonSerializer.Serialize(_characters, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_dataFilePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving characters to file");
            }
        }

        public async Task<List<Character>> GetAllCharactersAsync()
        {
            return _characters;
        }

        public async Task<Character> GetCharacterByIdAsync(string id)
        {
            var character = _characters.FirstOrDefault(c => c.Id == id);
            return character;
        }

        public async Task<Character> CreateCharacterAsync(Character character)
        {
            // Generate a new ID if one doesn't exist
            if (string.IsNullOrEmpty(character.Id))
            {
                character.Id = Guid.NewGuid().ToString();
            }
            
            _characters.Add(character);
            await SaveCharactersToFile();
            return character;
        }

        public async Task<Character> UpdateCharacterAsync(Character character)
        {
            var existingIndex = _characters.FindIndex(c => c.Id == character.Id);
            
            if (existingIndex == -1)
            {
                throw new KeyNotFoundException($"Character with ID {character.Id} not found");
            }
            
            _characters[existingIndex] = character;
            await SaveCharactersToFile();
            return character;
        }

        public async Task<bool> DeleteCharacterAsync(string id)
        {
            var removed = _characters.RemoveAll(c => c.Id == id) > 0;
            
            if (removed)
            {
                await SaveCharactersToFile();
            }
            
            return removed;
        }

        private List<Character> CreateSampleCharacters()
        {
            return new List<Character>
            {
                new Character
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Cornelius Blackthorn",
                    Career = "Rogue Trader",
                    Rank = "Master and Commander",
                    Characteristics = new CharacteristicsSet
                    {
                        WS = new Characteristic { Value = 35, Advances = 1},
                        BS = new Characteristic { Value = 40, Advances = 2},
                        S = new Characteristic { Value = 35, Advances = 0},
                        T = new Characteristic { Value = 40, Advances = 0},
                        Ag = new Characteristic { Value = 45, Advances = 2},
                        Int = new Characteristic { Value = 45, Advances = 1},
                        Per = new Characteristic { Value = 35, Advances = 0},
                        WP = new Characteristic { Value = 40, Advances = 0},
                        Fel = new Characteristic { Value = 50, Advances = 3}
                    },
                    Skills = new Dictionary<string, Skill>
                    {
                        ["Awareness"] = new Skill { Trained = true, Advances = 1, Characteristic = "per" },
                        ["Command"] = new Skill { Trained = true, Advances = 2, Characteristic = "fel" },
                        ["Commerce"] = new Skill { Trained = true, Advances = 2, Characteristic = "fel" },
                        ["Common Lore (Imperium)"] = new Skill { Trained = true, Advances = 1, Characteristic = "int" },
                        ["Deceive"] = new Skill { Trained = true, Advances = 1, Characteristic = "fel" },
                        ["Dodge"] = new Skill { Trained = true, Advances = 1, Characteristic = "ag" }
                    },
                    Talents = new List<Talent>
                    {
                        new Talent { Id = "airOfAuthority", Name = "Air of Authority", Description = "The character may make a Challenging (+0) Command Test to ignore a Fear Rating of 1." },
                        new Talent { Id = "peerImperium", Name = "Peer (Imperium)", Description = "The character gains a +10 bonus to all Fellowship Tests made to interact with members of the Imperium." },
                        new Talent { Id = "rapidReload", Name = "Rapid Reload", Description = "All reload times are reduced by one step (Full to Half, Half to Free)." }
                    },
                    Wounds = new Wounds { Total = 14, Current = 14 },
                    ExperiencePoints = new ExperiencePoints { Total = 5000, Spent = 3750 },
                    Background = new CharacterBackground
                    {
                        Homeworld = "Noble Born - Footfall",
                        Birthright = "Nobility",
                        LureOfVoid = "Calling of Destiny",
                        TrialsAndTravails = "Betrayal",
                        Motivation = "Profit",
                        Lineage = "Venerable Lineage",
                        Description = "Cornelius Blackthorn was born into the prestigious Blackthorn dynasty, a family known for its shrewd trade negotiations and vast wealth. As the firstborn son, he was always destined to inherit his family's Warrant of Trade, though he earned his position through cunning and determination rather than merely accepting his birthright.",
                        Notes = "Carries the family heirloom, the Blackthorn Seal, which grants him additional authority in Imperial negotiations."
                    }
                },
                new Character
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Magos Drakus",
                    Career = "Explorator",
                    Rank = "Lexmechanic",
                    Characteristics = new CharacteristicsSet
                    {
                        WS = new Characteristic { Value = 30, Advances = 0},
                        BS = new Characteristic { Value = 40, Advances = 1},
                        S = new Characteristic { Value = 35, Advances = 0},
                        T = new Characteristic { Value = 45, Advances = 2},
                        Ag = new Characteristic { Value = 35, Advances = 0},
                        Int = new Characteristic { Value = 60, Advances = 3},
                        Per = new Characteristic { Value = 40, Advances = 1},
                        WP = new Characteristic { Value = 45, Advances = 2},
                        Fel = new Characteristic { Value = 25, Advances = 0}
                    },
                    Skills = new Dictionary<string, Skill>
                    {
                        ["Tech-Use"] = new Skill { Trained = true, Advances = 3, Characteristic = "int" },
                        ["Logic"] = new Skill { Trained = true, Advances = 2, Characteristic = "int" },
                        ["Literacy"] = new Skill { Trained = true, Advances = 1, Characteristic = "int" },
                        ["Common Lore (Tech)"] = new Skill { Trained = true, Advances = 2, Characteristic = "int" },
                        ["Common Lore (Machine Cult)"] = new Skill { Trained = true, Advances = 2, Characteristic = "int" },
                        ["Security"] = new Skill { Trained = true, Advances = 1, Characteristic = "ag" }
                    },
                    Talents = new List<Talent>
                    {
                        new Talent { Id = "binaryChatter", Name = "Binary Chatter", Description = "The character may communicate with other Tech-Priests via binary code at a distance of up to 20 meters." },
                        new Talent { Id = "logisPredictor", Name = "Logis Predictor", Description = "The character may re-roll a single failed Intelligence Test per game session." },
                        new Talent { Id = "mechanicalProbingMechadendrite", Name = "Mechadendrite Use (Utility)", Description = "The character has a mechanical arm that can be used for Tech-Use Tests and similar actions." }
                    },
                    Wounds = new Wounds { Total = 12, Current = 10 },
                    ExperiencePoints = new ExperiencePoints { Total = 4500, Spent = 3000 },
                    Background = new CharacterBackground
                    {
                        Homeworld = "Lathe Worlds",
                        Birthright = "Tech-Adept",
                        LureOfVoid = "Quest for Knowledge",
                        TrialsAndTravails = "Machine Test",
                        Motivation = "Discovery",
                        Lineage = "Martian Descent",
                        Description = "Magos Drakus was inducted into the Mechanicus at an early age, showing exceptional aptitude for technical matters and data interpretation. They have dedicated their existence to the pursuit of lost technology and expanding their knowledge of machine spirits.",
                        Notes = "Particularly interested in xenos technology, though is careful to avoid tech-heresy accusations."
                    }
                }
            };
        }
    }
}