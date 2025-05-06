namespace VTT.Server.Models // Assuming your root namespace is VTT.Server
{
    // Information about an available rulebook
    public record RulebookInfo(
        string Alias,      // e.g., "rogue-trader-core-rulebook"
        string DisplayName // e.g., "Rogue Trader - Core-Rulebook"
    );

    // Structure of a page within a rulebook JSON
    public class RulebookPageDto
    {
        public int PageIndex { get; set; }
        public string Text { get; set; } = string.Empty; // Default value
    }

    // Structure for the entire rulebook JSON file (internal to service mostly)
    public class RulebookFileDto
    {
        // Use JsonPropertyName for mapping if needed, ensure case-insensitivity on deserialize
        // [System.Text.Json.Serialization.JsonPropertyName("filename")]
        public string Filename { get; set; } = string.Empty; // Original filename from JSON
        public List<RulebookPageDto> Pages { get; set; } = new List<RulebookPageDto>();
    }

    // Metadata returned by the API
    public record RulebookMetadataDto(
        string Alias,
        string DisplayName,
        int PageCount,
        int FirstPageIndex,
        int LastPageIndex
    );

    // Page data returned by the API
    public record RulebookPagesResponseDto(
        string Alias,
        string DisplayName,
        int TotalPages,
        List<RulebookPageDto> Pages
    );
}