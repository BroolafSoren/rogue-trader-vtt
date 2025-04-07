using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using src.models;

namespace src.routes
{
    [ApiController]
    [Route("/api/characters")]
    public class CharactersController : ControllerBase
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly ILogger<CharactersController> _logger;

        public CharactersController(ICharacterRepository characterRepository, ILogger<CharactersController> logger)
        {
            _characterRepository = characterRepository;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Character>>> GetAllCharacters()
        {
            try
            {
                var characters = await _characterRepository.GetAllCharactersAsync();
                return Ok(characters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all characters");
                return StatusCode(500, "Internal server error");
            }
        }

        // Fixed route conflict by specifying unique route pattern
        [HttpGet("{id}")]
        public async Task<ActionResult<Character>> GetCharacter(string id)
        {
            try
            {
                var character = await _characterRepository.GetCharacterByIdAsync(id);
                
                if (character == null)
                {
                    return NotFound();
                }
                
                return Ok(character);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving character {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Character>> CreateCharacter([FromBody] Character character)
        {
            try
            {
                var created = await _characterRepository.CreateCharacterAsync(character);
                return CreatedAtAction(nameof(GetCharacter), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating character");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Character>> UpdateCharacter(string id, [FromBody] Character character)
        {
            Console.WriteLine($"PUT request received for character ID: {id}");
            
            if (character == null)
            {
                Console.WriteLine("Character is null");
                return BadRequest("Character data is null");
            }

            Console.WriteLine($"Character ID from body: {character.Id}");
            Console.WriteLine($"Character Name: {character.Name}");
            Console.WriteLine($"Background notes: {character.Background?.Notes?.Length ?? 0} chars");
            
            try 
            {
                if (id != character.Id)
                {
                    Console.WriteLine($"ID mismatch: URL={id}, Body={character.Id}");
                    return BadRequest("ID mismatch");
                }

                var existingCharacter = await _characterRepository.GetCharacterByIdAsync(id);
                if (existingCharacter == null)
                {
                    Console.WriteLine($"Character with ID {id} not found");
                    return NotFound();
                }

                // Update the existing character
                var result = await _characterRepository.UpdateCharacterAsync(character);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UpdateCharacter: {ex}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCharacter(string id)
        {
            try
            {
                var character = await _characterRepository.GetCharacterByIdAsync(id);
                
                if (character == null)
                {
                    return NotFound();
                }
                
                await _characterRepository.DeleteCharacterAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting character {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET api/characters/debug
        [HttpGet("debug")]
        public IActionResult DebugInfo()
        {
            try
            {
                // Return information about the repository and data file path
                return Ok(new
                {
                    message = "Character API is working correctly",
                    dataFolderExists = Directory.Exists(Path.Combine(Directory.GetCurrentDirectory(), "data")),
                    characterCount = _characterRepository.GetAllCharactersAsync().Result.Count,
                    dateTime = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in debug endpoint");
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }
    }
}