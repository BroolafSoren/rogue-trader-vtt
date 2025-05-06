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
        private readonly ConcurrentDictionary<string, RulebookFileDto> _loadedRulebooksCache = new();
        private bool _isInitialized = false;
        private readonly object _initLock = new object();
        private static readonly Regex _aliasRegex = new Regex(@"[^a-z0-9]+", RegexOptions.Compiled);

        public FileSystemRulebookService(ILogger<FileSystemRulebookService> logger)
        {
            _logger = logger;
            string foundPath = "";

            try
            {
                string currentDir = Directory.GetCurrentDirectory();
                _logger.LogInformation("Attempting to find assets folder. Current Directory: {CurrentDir}", currentDir);

                string[] relativePathsToCheck = {
                    "assets", "Assets", "server/assets", "server/Assets",
                    Path.Combine("..", "..", "..", "server", "assets"),
                    Path.Combine("..", "..", "..", "server", "Assets")
                 };

                foreach (var relativePath in relativePathsToCheck)
                {
                    var potentialPath = Path.GetFullPath(Path.Combine(currentDir, relativePath));
                    _logger.LogDebug("Checking potential assets path: {PotentialPath}", potentialPath);
                    if (Directory.Exists(potentialPath))
                    {
                        foundPath = potentialPath;
                        _logger.LogInformation("Assets folder found at: {FoundPath}", foundPath);
                        break;
                    }
                     else {
                         _logger.LogDebug("Path does not exist: {PotentialPath}", potentialPath);
                     }
                }

                if (string.IsNullOrEmpty(foundPath))
                {
                    _assetsFolder = Path.Combine(currentDir, "assets");
                    _logger.LogWarning("Could not find assets folder after checking multiple locations. Defaulting to: {DefaultPath}. Ensure the folder exists and the Dockerfile copies it correctly.", _assetsFolder);
                }
                else
                {
                    _assetsFolder = foundPath;
                }
            }
            catch(Exception ex)
            {
                 _logger.LogError(ex, "Exception during assets folder path resolution.");
                 _assetsFolder = Path.Combine(Directory.GetCurrentDirectory(), "assets");
                 _logger.LogWarning("Falling back to default assets path due to exception: {DefaultPath}", _assetsFolder);
            }
        }

        private void EnsureInitialized()
        {
            if (_isInitialized) return;
            lock (_initLock)
            {
                if (_isInitialized) return;
                _logger.LogInformation("Initializing Rulebook Service - Scanning assets folder: {AssetsFolder}", _assetsFolder);
                _aliasToFilepathMap.Clear();

                if (!Directory.Exists(_assetsFolder))
                {
                    _logger.LogError("Assets folder not found during initialization: {AssetsFolder}", _assetsFolder);
                    _isInitialized = true;
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
                             _logger.LogDebug("Mapped alias {RulebookAlias} to file {FilePath}", alias, filePath);
                        }
                        else
                        {
                            _logger.LogWarning("Duplicate alias generated: {RulebookAlias} for file {FilePath}. Check filenames.", alias, filePath);
                        }
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "Error scanning assets folder during initialization."); }
                _isInitialized = true;
                _logger.LogInformation("Rulebook Service Initialization Complete. Found {Count} rulebooks.", _aliasToFilepathMap.Count);
            }
        }

        private string GenerateAlias(string filename)
        {
            if (string.IsNullOrWhiteSpace(filename)) return string.Empty;
            var lower = filename.ToLowerInvariant();
            var replaced = _aliasRegex.Replace(lower, "-");
            var alias = replaced.Trim('-');
            return string.IsNullOrWhiteSpace(alias) ? "invalid-alias" : alias;
        }

        private async Task<RulebookFileDto?> LoadRulebookAsync(string alias)
        {
            if (_loadedRulebooksCache.TryGetValue(alias, out var cachedRulebook))
            {
                _logger.LogDebug("Cache hit for rulebook alias {RulebookAlias}", alias);
                return cachedRulebook;
            }

            if (!_aliasToFilepathMap.TryGetValue(alias, out var filePath))
            {
                _logger.LogWarning("Alias {RulebookAlias} not found in map.", alias);
                return null;
            }

            if (!File.Exists(filePath))
            {
                _logger.LogError("File path for alias {RulebookAlias} does not exist: {FilePath}", alias, filePath);
                 _aliasToFilepathMap.TryRemove(alias, out _);
                return null;
            }

            try
            {
                _logger.LogInformation("Loading and parsing rulebook file for alias {RulebookAlias}: {FilePath}", alias, filePath);
                var jsonString = await File.ReadAllTextAsync(filePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var rulebook = JsonSerializer.Deserialize<RulebookFileDto>(jsonString, options);

                if (rulebook != null)
                {
                    _logger.LogDebug("Successfully parsed rulebook {OriginalFilename}, {PageCount} pages. Caching result for alias {RulebookAlias}.", rulebook.Filename, rulebook.Pages?.Count ?? 0, alias);
                    _loadedRulebooksCache.TryAdd(alias, rulebook);
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
            EnsureInitialized();
            var rulebookInfos = _aliasToFilepathMap.Select(kvp =>
            {
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
                DisplayName: originalFilename,
                PageCount: rulebook.Pages.Count,
                FirstPageIndex: rulebook.Pages.FirstOrDefault()?.PageIndex ?? -1,
                LastPageIndex: rulebook.Pages.LastOrDefault()?.PageIndex ?? -1
            );
        }

        public async Task<RulebookPagesResponseDto?> GetPagesByAliasAsync(string alias, int startIndex, int count)
        {
            EnsureInitialized();
            var rulebook = await LoadRulebookAsync(alias);
            if (rulebook == null || rulebook.Pages == null) return null;
            startIndex = Math.Max(0, startIndex);
            count = Math.Max(1, count);
            var pagesInRange = rulebook.Pages
                .OrderBy(p => p.PageIndex)
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