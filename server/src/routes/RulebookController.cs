using System;
using System.Linq;
using System.Threading.Tasks; // Added
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using VTT.Server.Services; // Added
using VTT.Server.Models; // Added

namespace VTT.Server.Routes // Use consistent namespace
{
    [ApiController]
    [Route("api/[controller]")]
    public class RulebookController : ControllerBase
    {
        private readonly ILogger<RulebookController> _logger;
        private readonly IRulebookService _rulebookService; // Use the service interface

        // Inject the service
        public RulebookController(ILogger<RulebookController> logger, IRulebookService rulebookService)
        {
            _logger = logger;
            _rulebookService = rulebookService; // Store injected service
        }

        // Remove internal model classes (they are now in RulebookDtos.cs)
        // public class RulebookPage { ... }
        // public class Rulebook { ... }

        // Optional: Update debug endpoint to show service status? Or remove it.
        [HttpGet("debug")]
        public IActionResult Debug()
        {
             _logger.LogInformation("RulebookController Debug endpoint hit.");
            // Could add more info here later if needed, e.g., check service health
            return Ok(new { message = "RulebookController is working. Service is injected." });
        }

        // Get list of available rulebooks (using aliases now)
        [HttpGet]
        public async Task<IActionResult> GetRulebooks()
        {
            try
            {
                _logger.LogInformation("Requesting list of rulebooks from service.");
                var rulebooks = await _rulebookService.ListAvailableRulebooksAsync();
                _logger.LogInformation("Service returned {Count} rulebooks.", rulebooks.Count());
                // Return the RulebookInfo DTO directly
                return Ok(rulebooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rulebook list via service");
                return StatusCode(500, $"Error retrieving rulebook list: {ex.Message}");
            }
        }

        // Get metadata - Use alias in route
        [HttpGet("{alias}/metadata")]
        public async Task<IActionResult> GetRulebookMetadata(string alias) // Changed parameter name
        {
            try
            {
                 _logger.LogInformation("Requesting metadata for rulebook alias '{Alias}'.", alias);
                var metadata = await _rulebookService.GetMetadataByAliasAsync(alias);

                if (metadata == null)
                {
                    _logger.LogWarning("Metadata not found for alias '{Alias}'.", alias);
                    return NotFound($"Rulebook with alias '{alias}' not found.");
                }

                _logger.LogDebug("Metadata found for alias '{Alias}'.", alias);
                return Ok(metadata); // Return the DTO
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metadata for rulebook alias: {Alias}", alias);
                return StatusCode(500, $"Error retrieving metadata for rulebook alias: {alias}");
            }
        }

        // Get pages - Use alias in route
        [HttpGet("{alias}/pages")]
        public async Task<IActionResult> GetRulebookPages(string alias, [FromQuery] int startIndex = 0, [FromQuery] int count = 5) // Changed route param, added defaults
        {
             // Ensure count is reasonable
            count = Math.Clamp(count, 1, 100); // Prevent excessive page requests
            startIndex = Math.Max(0, startIndex);

            try
            {
                 _logger.LogInformation("Requesting pages for rulebook alias '{Alias}', StartIndex: {StartIndex}, Count: {Count}.", alias, startIndex, count);
                var pagesResponse = await _rulebookService.GetPagesByAliasAsync(alias, startIndex, count);

                if (pagesResponse == null)
                {
                    _logger.LogWarning("Pages not found for alias '{Alias}'.", alias);
                    return NotFound($"Rulebook with alias '{alias}' not found.");
                }

                _logger.LogDebug("Returning {PageCount} pages for alias '{Alias}'.", pagesResponse.Pages.Count, alias);
                return Ok(pagesResponse); // Return the DTO
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pages for rulebook alias: {Alias}", alias);
                return StatusCode(500, $"Error retrieving pages for rulebook alias: {alias}");
            }
        }
    }
}