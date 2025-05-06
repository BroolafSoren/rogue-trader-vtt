using System.Collections.Generic;
using System.Threading.Tasks;
using VTT.Server.Models;

namespace VTT.Server.Services
{
    public interface IRulebookService
    {
        /// <summary>
        /// Gets information about all available rulebooks.
        /// </summary>
        Task<IEnumerable<RulebookInfo>> ListAvailableRulebooksAsync();

        /// <summary>
        /// Gets metadata for a specific rulebook identified by its alias.
        /// </summary>
        Task<RulebookMetadataDto?> GetMetadataByAliasAsync(string alias);

        /// <summary>
        /// Gets a range of pages for a specific rulebook identified by its alias.
        /// </summary>
        Task<RulebookPagesResponseDto?> GetPagesByAliasAsync(string alias, int startIndex, int count);

        // Optional: Add a method to explicitly trigger initialization if needed outside constructor
        // Task InitializeAsync();
    }
}