using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Bson;

namespace src.models
{
    public class MongoCharacterRepository : ICharacterRepository
    {
        private readonly IMongoCollection<Character> _characters;

        public MongoCharacterRepository(string connectionString)
        {
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("roguetrader");
            _characters = database.GetCollection<Character>("characters");
        }

        public async Task<List<Character>> GetAllCharactersAsync()
        {
            return await _characters.Find(_ => true).ToListAsync();
        }

        public async Task<Character> GetCharacterByIdAsync(string id)
        {
            // Ensure we have a valid ObjectId
            if (!ObjectId.TryParse(id, out _))
            {
                return null;
            }
            
            return await _characters.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Character> CreateCharacterAsync(Character character)
        {
            if (string.IsNullOrEmpty(character.Id))
            {
                character.Id = ObjectId.GenerateNewId().ToString();
            }
            else if (!ObjectId.TryParse(character.Id, out _))
            {
                // If ID isn't a valid ObjectId, generate a new one
                character.Id = ObjectId.GenerateNewId().ToString();
            }
            
            await _characters.InsertOneAsync(character);
            return character;
        }

        public async Task<Character> UpdateCharacterAsync(Character character)
        {
            try 
            {
                Console.WriteLine($"Updating character in MongoDB: {character.Id}");
                var filter = Builders<Character>.Filter.Eq(c => c.Id, character.Id);
                var result = await _characters.ReplaceOneAsync(filter, character);

                if (result.IsAcknowledged && result.ModifiedCount > 0)
                {
                    Console.WriteLine("MongoDB update successful");
                    return character;
                }
                else
                {
                    Console.WriteLine($"MongoDB update failed: {result.ModifiedCount} documents modified");
                    throw new Exception("Failed to update character in database");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MongoDB update error: {ex.Message}");
                throw; // Rethrow to be caught in controller
            }
        }

        public async Task<bool> DeleteCharacterAsync(string id)
        {
            var result = await _characters.DeleteOneAsync(c => c.Id == id);
            return result.DeletedCount > 0;
        }
    }
}