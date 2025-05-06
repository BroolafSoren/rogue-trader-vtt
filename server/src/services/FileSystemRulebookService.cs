using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using VTT.Server.Models;

namespace VTT.Server.Services
{
    public class FileSystemRulebookService : IRulebookService
    {
        private readonly ILogger<FileSystemRulebookService> _logger;
        private readonly string _assetsFolder;
        private readonly ConcurrentDictionary<string, string> _aliasToFilepathMap = new();
        private readonly ConcurrentDictionary<string, RulebookFileDto> _loadedRulebooksCache = new(); // Cache loaded data
        private bool _isInitialized = false;
        private readonly object _initLock = new object();

        // Regular expression for safe alias generation
        private static readonly Regex _aliasRegex = new Regex(@"[^a-z0-9]+", RegexOptions.Compiled);

        public FileSystemRulebookService(ILogger<FileSystemRulebookService> logger)
        {
            _logger = logger;

            // Robust path finding (similar to original controller)
            string currentDir = Directory.GetCurrentDirectory();
            string[] potentialPaths = {
                Path.Combine(currentDir, "assets"),          // Common case when running from server dir
                Path.Combine(currentDir, "server", "assets"),// Common case when running from project root
                Path.Combine(currentDir, "Assets"),          // Case variations
                Path.Combine(currentDir, "server", "Assets"),
                Path.Combine(currentDir, "..", "assets"),     // If running from bin/Debug etc.
                Path.Combine(currentDir, "..", "Assets")
            };

            _assetsFolder = potentialPaths.FirstOrDefault(Directory.Exists)
                            ?? Path.Combine(currentDir, "assets"); // Default fallback

            _logger.LogInformation("FileSystemRulebookService using assets folder: {AssetsFolder}", _assetsFolder);
            if (!Directory.Exists(_assetsFolder))
            {
                _logger.LogWarning("Assets folder does not exist at determined path: {AssetsFolder}", _assetsFolder);
            }

            // Note: Initialization (scanning files) is deferred until the first request
        }

        // Deferred initialization method
        private void EnsureInitialized()
        {
            // Double-check locking for thread safety during initialization
            if (_isInitialized) return;

            lock (_initLock)
            {
                if (_isInitialized) return; // Check again inside lock

                _logger.LogInformation("Initializing Rulebook Service - Scanning assets folder: {AssetsFolder}", _assetsFolder);
                _aliasToFilepathMap.Clear(); // Clear previous state if re-initializing

                if (!Directory.Exists(_assetsFolder))
                {
                    _logger.LogError("Assets folder not found during initialization: {AssetsFolder}", _assetsFolder);
                    _isInitialized = true; // Mark as initialized even if failed
                    return;
                }

                try
                {
                    var jsonFiles = Directory.GetFiles(_assetsFolder, "*.json");
                    _logger.LogInformation("Found {Count} JSON files in assets folder.", jsonFiles.Length);

                    foreach (var filePath in jsonFiles)
                    {
                        var filename = Path.GetFileNameWithoutExtension(filePath);
                        var alias = GenerateAlias(filename);

                        if (_aliasToFilepathMap.TryAdd(alias, filePath))
                        {
                             _logger.LogDebug("Mapped alias '{Alias}' to file '{FilePath}'", alias, filePath);
                        }
                        else
                        {
                            _logger.LogWarning("Duplicate alias generated: '{Alias}' for file '{FilePath}'. Check filenames.", alias, filePath);
                            // Handle duplicate aliases if necessary (e.g., append a number)
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error scanning assets folder during initialization.");
                    // Depending on requirements, you might want to throw or just log
                }
                _isInitialized = true;
                _logger.LogInformation("Rulebook Service Initialization Complete. Found {Count} rulebooks.", _aliasToFilepathMap.Count);
            }
        }

        // Helper to generate a safe, URL-friendly alias from a filename
        private string GenerateAlias(string filename)
        {
            if (string.IsNullOrWhiteSpace(filename)) return string.Empty;

            var lower = filename.ToLowerInvariant();
            // Replace sequences of non-alphanumeric characters with a single hyphen
            var replaced = _aliasRegex.Replace(lower, "-");
            // Trim leading/trailing hyphens
            var alias = replaced.Trim('-');
            // Handle potential empty string after trimming
            return string.IsNullOrWhiteSpace(alias) ? "invalid-alias" : alias;
        }

        // Helper to load (and cache) a rulebook file
        private async Task<RulebookFileDto?> LoadRulebookAsync(string alias)
        {
            if (_loadedRulebooksCache.TryGetValue(alias, out var cachedRulebook))
            {
                _logger.LogDebug("Cache hit for rulebook alias: {Alias}", alias);
                return cachedRulebook;
            }

            if (!_aliasToFilepathMap.TryGetValue(alias, out var filePath))
            {
                _logger.LogWarning("Alias '{Alias}' not found in map.", alias);
                return null; // Alias doesn't exist
            }

            if (!File.Exists(filePath))
            {
                _logger.LogError("File path for alias '{Alias}' does not exist: {FilePath}", alias, filePath);
                 _aliasToFilepathMap.TryRemove(alias, out _); // Remove invalid entry
                return null; // File missing
            }

            try
            {
                _logger.LogInformation("Loading and parsing rulebook file for alias '{Alias}': {FilePath}", alias, filePath);
                var jsonString = await File.ReadAllTextAsync(filePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var rulebook = JsonSerializer.Deserialize<RulebookFileDto>(jsonString, options);

                if (rulebook != null)
                {
                     _logger.LogDebug("Successfully parsed rulebook '{Filename}', {PageCount} pages. Caching result for alias {Alias}.", rulebook.Filename, rulebook.Pages?.Count ?? 0, alias);
                    _loadedRulebooksCache.TryAdd(alias, rulebook); // Add to cache
                    return rulebook;
                }
                else
                {
                    _logger.LogError("Failed to deserialize JSON for rulebook file: {FilePath}", filePath);
                    return null;
                }
            }
            catch (JsonException jsonEx)
            {
                 _logger.LogError(jsonEx, "JSON parsing error for rulebook file: {FilePath}", filePath);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading or parsing rulebook file: {FilePath}", filePath);
                return null;
            }
        }

        public Task<IEnumerable<RulebookInfo>> ListAvailableRulebooksAsync()
        {
            EnsureInitialized(); // Make sure the map is populated

            var rulebookInfos = _aliasToFilepathMap.Select(kvp =>
            {
                // Extract display name from the original filename before alias generation
                var originalFilename = Path.GetFileNameWithoutExtension(kvp.Value);
                return new RulebookInfo(kvp.Key, originalFilename);
            }).ToList();

            return Task.FromResult<IEnumerable<RulebookInfo>>(rulebookInfos);
        }

        public async Task<RulebookMetadataDto?> GetMetadataByAliasAsync(string alias)
        {
            EnsureInitialized();
            var rulebook = await LoadRulebookAsync(alias);

            if (rulebook == null || rulebook.Pages == null) return null;

            var originalFilename = Path.GetFileNameWithoutExtension(_aliasToFilepathMap.GetValueOrDefault(alias) ?? "");

            return new RulebookMetadataDto(
                Alias: alias,
                DisplayName: originalFilename, // Use original name for display
                PageCount: rulebook.Pages.Count,
                FirstPageIndex: rulebook.Pages.FirstOrDefault()?.PageIndex ?? -1, // Use -1 or similar for 'not found'
                LastPageIndex: rulebook.Pages.LastOrDefault()?.PageIndex ?? -1
            );
        }

        public async Task<RulebookPagesResponseDto?> GetPagesByAliasAsync(string alias, int startIndex, int count)
        {
            EnsureInitialized();
            var rulebook = await LoadRulebookAsync(alias);

            if (rulebook == null || rulebook.Pages == null) return null;

            // Ensure valid range
            startIndex = Math.Max(0, startIndex);
            count = Math.Max(1, count); // Get at least 1 page if requested

            var pagesInRange = rulebook.Pages
                .OrderBy(p => p.PageIndex) // Ensure pages are ordered correctly
                .Skip(startIndex)
                .Take(count)
                .ToList();

             var originalFilename = Path.GetFileNameWithoutExtension(_aliasToFilepathMap.GetValueOrDefault(alias) ?? "");

            return new RulebookPagesResponseDto(
                Alias: alias,
                DisplayName: originalFilename,
                TotalPages: rulebook.Pages.Count,
                Pages: pagesInRange
            );
        }
    }
}