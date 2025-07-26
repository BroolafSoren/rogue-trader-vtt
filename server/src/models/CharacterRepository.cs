using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace VTT.Server.Models
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
    }
}