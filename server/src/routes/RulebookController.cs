using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using VTT.Server.Services;
using src.models;

namespace src.Routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class RulebookController : ControllerBase
    {
        private readonly ILogger<RulebookController> _logger;
        private readonly IRulebookService _rulebookService;

        public RulebookController(ILogger<RulebookController> logger, IRulebookService rulebookService)
        {
            _logger = logger;
            _rulebookService = rulebookService;
        }

        [HttpGet("debug")]
        public IActionResult Debug()
        {
             _logger.LogInformation("RulebookController Debug endpoint hit.");
            return Ok(new { message = "RulebookController is working. Service is injected." });
        }

        [HttpGet]
        public async Task<IActionResult> GetRulebooks()
        {
            try
            {
                _logger.LogInformation("Requesting list of rulebooks from service.");
                var rulebooks = await _rulebookService.ListAvailableRulebooksAsync();
                _logger.LogInformation("Service returned {RulebookCount} rulebooks.", rulebooks.Count());
                return Ok(rulebooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rulebook list via service");
                return StatusCode(500, "Error retrieving rulebook list");
            }
        }

        [HttpGet("{alias}/metadata")]
        public async Task<IActionResult> GetRulebookMetadata(string alias)
        {
            try
            {
                 _logger.LogInformation("Requesting metadata for rulebook alias {RulebookAlias}", alias);
                var metadata = await _rulebookService.GetMetadataByAliasAsync(alias);

                if (metadata == null)
                {
                    _logger.LogWarning("Metadata not found for alias {RulebookAlias}", alias);
                    return NotFound($"Rulebook alias not found.");
                }

                _logger.LogDebug("Metadata found for alias {RulebookAlias}", alias);
                return Ok(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving metadata for rulebook alias {RulebookAlias}", alias);
                return StatusCode(500, "Error retrieving rulebook metadata");
            }
        }

        [HttpGet("{alias}/pages")]
        public async Task<IActionResult> GetRulebookPages(string alias, [FromQuery] int startIndex = 0, [FromQuery] int count = 5)
        {
            count = Math.Clamp(count, 1, 100);
            startIndex = Math.Max(0, startIndex);

            try
            {
                 _logger.LogInformation("Requesting pages for rulebook alias {RulebookAlias}, StartIndex: {StartIndex}, Count: {PageCount}", alias, startIndex, count);
                var pagesResponse = await _rulebookService.GetPagesByAliasAsync(alias, startIndex, count);

                if (pagesResponse == null)
                {
                    _logger.LogWarning("Pages not found for alias {RulebookAlias}", alias);
                    return NotFound($"Rulebook alias not found.");
                }

                _logger.LogDebug("Returning {PageCount} pages for alias {RulebookAlias}", pagesResponse.Pages.Count, alias);
                return Ok(pagesResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pages for rulebook alias {RulebookAlias}", alias);
                return StatusCode(500, "Error retrieving rulebook pages");
            }
        }
    }
}