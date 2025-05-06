using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using src.models;

namespace VTT.Server.Routes
{
    [ApiController]
    [Route("/api/characters")]
    public class CharactersController : ControllerBase
    {
        private readonly ICharacterRepository _characterRepository;
        private readonly ILogger<CharactersController> _logger;

        public CharactersController(ICharacterRepository characterRepository, ILogger<CharactersController> logger)
        {
            _characterRepository = characterRepository ?? throw new ArgumentNullException(nameof(characterRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Character>>> GetAllCharacters()
        {
            try
            {
                 _logger.LogInformation("Attempting to retrieve all characters.");
                var characters = await _characterRepository.GetAllCharactersAsync();
                _logger.LogInformation("Retrieved {CharacterCount} characters.", characters?.Count() ?? 0);
                return Ok(characters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all characters");
                return StatusCode(500, "Internal server error retrieving characters");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Character>> GetCharacter(string id)
        {
            try
            {
                 _logger.LogInformation("Attempting to retrieve character with ID {CharacterId}", id);
                var character = await _characterRepository.GetCharacterByIdAsync(id);

                if (character == null)
                {
                     _logger.LogWarning("Character with ID {CharacterId} not found.", id);
                    return NotFound();
                }

                 _logger.LogInformation("Character with ID {CharacterId} found.", id);
                return Ok(character);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving character with ID {CharacterId}", id);
                return StatusCode(500, "Internal server error retrieving character");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Character>> CreateCharacter([FromBody] Character character)
        {
            try
            {
                 _logger.LogInformation("Attempting to create new character.");
                var created = await _characterRepository.CreateCharacterAsync(character);
                 _logger.LogInformation("Character created successfully with ID {CharacterId}", created.Id);
                return CreatedAtAction(nameof(GetCharacter), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating character.");
                return StatusCode(500, "Internal server error creating character");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Character>> UpdateCharacter(string id, [FromBody] Character character)
        {
             _logger.LogDebug("PUT request received for character ID {CharacterId_URL}", id);

            if (character == null)
            {
                _logger.LogWarning("UpdateCharacter received null character data in body.");
                return BadRequest("Character data is null");
            }

             _logger.LogDebug("Character ID from body: {CharacterId_Body}", character.Id);
             _logger.LogDebug("Background notes length from body: {BackgroundNotesLength}", character.Background?.Notes?.Length ?? 0);

            try
            {
                if (id != character.Id)
                {
                     _logger.LogWarning("ID mismatch during character update. URL ID: {CharacterId_URL}, Body ID: {CharacterId_Body}", id, character.Id);
                    return BadRequest("ID mismatch");
                }

                var existingCharacter = await _characterRepository.GetCharacterByIdAsync(id);
                if (existingCharacter == null)
                {
                     _logger.LogWarning("Character not found during update attempt for ID {CharacterId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Attempting to update character with ID {CharacterId}", id);
                var result = await _characterRepository.UpdateCharacterAsync(character);
                 _logger.LogInformation("Successfully updated character with ID {CharacterId}", id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during UpdateCharacter for ID {CharacterId}", id);
                return StatusCode(500, "Internal server error updating character");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCharacter(string id)
        {
            try
            {
                 _logger.LogInformation("Attempting to delete character with ID {CharacterId}", id);
                var character = await _characterRepository.GetCharacterByIdAsync(id);

                if (character == null)
                {
                     _logger.LogWarning("Character not found during delete attempt for ID {CharacterId}", id);
                    return NotFound();
                }

                await _characterRepository.DeleteCharacterAsync(id);
                 _logger.LogInformation("Successfully deleted character with ID {CharacterId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting character with ID {CharacterId}", id);
                return StatusCode(500, "Internal server error deleting character");
            }
        }

        [HttpGet("debug")]
        public async Task<IActionResult> DebugInfo()
        {
            try
            {
                 _logger.LogInformation("CharacterController Debug endpoint hit.");
                 long characterCount = 0;
                 bool repoSuccess = false;
                 try
                 {
                     var characters = await _characterRepository.GetAllCharactersAsync();
                     characterCount = characters?.LongCount() ?? 0;
                     repoSuccess = true;
                 }
                 catch(Exception repoEx)
                 {
                      _logger.LogError(repoEx, "Error accessing character repository within debug endpoint.");
                 }

                return Ok(new
                {
                    message = "Character API working.",
                    repositoryAccessible = repoSuccess,
                    approximateCharacterCount = characterCount,
                    serverTime = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in character debug endpoint itself");
                return StatusCode(500, new { error = "Error generating debug info." });
            }
        }
    }
}