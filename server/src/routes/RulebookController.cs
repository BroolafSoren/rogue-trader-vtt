using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace src.routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class RulebookController : ControllerBase
    {
        private readonly ILogger<RulebookController> _logger;
        private readonly string _assetsFolder;

        public RulebookController(ILogger<RulebookController> logger)
        {
            _logger = logger;
            // Fix path issues with a more robust approach
            string currentDir = Directory.GetCurrentDirectory();
            _logger.LogInformation($"Current directory: {currentDir}");
            
            // Try different approaches to locate the assets folder
            string assetsPath1 = Path.Combine(currentDir, "Assets");
            string assetsPath2 = Path.Combine(currentDir, "..", "Assets");
            string assetsPath3 = Path.Combine(currentDir, "assets");
            string assetsPath4 = Path.Combine(currentDir, "..", "assets");
            
            _logger.LogInformation($"Potential paths:\n1: {assetsPath1} (exists: {Directory.Exists(assetsPath1)})\n" + 
                                  $"2: {assetsPath2} (exists: {Directory.Exists(assetsPath2)})\n" + 
                                  $"3: {assetsPath3} (exists: {Directory.Exists(assetsPath3)})\n" + 
                                  $"4: {assetsPath4} (exists: {Directory.Exists(assetsPath4)})");
            
            // Use the first valid path
            if (Directory.Exists(assetsPath1)) _assetsFolder = assetsPath1;
            else if (Directory.Exists(assetsPath2)) _assetsFolder = assetsPath2;
            else if (Directory.Exists(assetsPath3)) _assetsFolder = assetsPath3;
            else if (Directory.Exists(assetsPath4)) _assetsFolder = assetsPath4;
            else
            {
                _logger.LogError("Could not find assets folder!");
                _assetsFolder = assetsPath1; // Default to something even if it doesn't exist
            }
            
            _logger.LogInformation($"Using assets folder: {_assetsFolder}");
        }

        // Model classes for the rulebook JSON structure
        public class RulebookPage
        {
            public int PageIndex { get; set; }
            public string Text { get; set; }
        }

        public class Rulebook
        {
            public string Filename { get; set; }
            public List<RulebookPage> Pages { get; set; }
        }

        // Debug endpoint to verify controller is working
        [HttpGet("debug")]
        public IActionResult Debug()
        {
            return Ok(new { 
                message = "RulebookController is working",
                assetsFolder = _assetsFolder,
                assetsExists = Directory.Exists(_assetsFolder),
                files = Directory.Exists(_assetsFolder) ? 
                    Directory.GetFiles(_assetsFolder).Select(Path.GetFileName).ToArray() : 
                    new string[0]
            });
        }

        // Get metadata about the available rulebooks
        [HttpGet]
        public IActionResult GetRulebooks()
        {
            try
            {
                _logger.LogInformation($"Getting rulebooks from {_assetsFolder}");
                
                if (!Directory.Exists(_assetsFolder))
                {
                    _logger.LogError($"Assets folder not found: {_assetsFolder}");
                    return NotFound($"Assets folder not found: {_assetsFolder}");
                }
                
                var files = Directory.GetFiles(_assetsFolder, "*.json");
                _logger.LogInformation($"Found {files.Length} JSON files");
                
                var rulebookFiles = files.Select(path => new { 
                    filename = Path.GetFileNameWithoutExtension(path)
                }).ToList();

                return Ok(rulebookFiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving rulebook list");
                return StatusCode(500, $"Error retrieving rulebook list: {ex.Message}");
            }
        }

        // Get page count for a specific rulebook
        [HttpGet("{filename}/metadata")]
        public IActionResult GetRulebookMetadata(string filename)
        {
            try
            {
                var filePath = Path.Combine(_assetsFolder, $"{filename}.json");
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Rulebook '{filename}' not found");
                }

                // Read the file to get the number of pages
                var jsonString = System.IO.File.ReadAllText(filePath);
                var rulebook = JsonSerializer.Deserialize<Rulebook>(jsonString, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return Ok(new { 
                    filename = rulebook.Filename,
                    pageCount = rulebook.Pages.Count,
                    firstPageIndex = rulebook.Pages.FirstOrDefault()?.PageIndex ?? 0,
                    lastPageIndex = rulebook.Pages.LastOrDefault()?.PageIndex ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving metadata for rulebook: {filename}");
                return StatusCode(500, $"Error retrieving metadata for rulebook: {filename}");
            }
        }

        // Get pages from a specific rulebook within a range
        [HttpGet("{filename}/pages")]
        public IActionResult GetRulebookPages(string filename, [FromQuery] int startIndex, [FromQuery] int count = 5)
        {
            try
            {
                var filePath = Path.Combine(_assetsFolder, $"{filename}.json");
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound($"Rulebook '{filename}' not found");
                }

                // Read the file
                var jsonString = System.IO.File.ReadAllText(filePath);
                var rulebook = JsonSerializer.Deserialize<Rulebook>(jsonString, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                // Get pages in the requested range
                var pagesInRange = rulebook.Pages
                    .Skip(startIndex)
                    .Take(count)
                    .ToList();

                return Ok(new {
                    filename = rulebook.Filename,
                    totalPages = rulebook.Pages.Count,
                    pages = pagesInRange
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving pages for rulebook: {filename}");
                return StatusCode(500, $"Error retrieving pages for rulebook: {filename}");
            }
        }
    }
}