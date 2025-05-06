import React, { useState, useEffect } from 'react';
import {
    rulebookService,
    RulebookInfo,      
    RulebookPage,
    RulebookMetadata,
} from '../services/rulebookService';
import '../styles/EncyclopediaPage.css';

const PAGES_PER_VIEW = 5;

export default function EncyclopediaPage() {
  // State holds RulebookInfo objects
  const [rulebooks, setRulebooks] = useState<RulebookInfo[]>([]);
  // selectedRulebookAlias holds the ALIAS (string)
  const [selectedRulebookAlias, setSelectedRulebookAlias] = useState<string>('');
  const [metadata, setMetadata] = useState<RulebookMetadata | null>(null);
  const [pages, setPages] = useState<RulebookPage[]>([]);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available rulebooks on component mount
  useEffect(() => {
    const fetchRulebooks = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const booksInfo = await rulebookService.getRulebooks();
        console.log('Fetched rulebooks info:', booksInfo);

        setRulebooks(booksInfo); // Store the array of RulebookInfo

        if (booksInfo.length > 0) {
          // Set the selected ALIAS from the first book
          setSelectedRulebookAlias(booksInfo[0].alias);
        } else {
          setError('No rulebooks found. Check server configuration and assets folder.');
        }
      } catch (err) {
        setError('Failed to load rulebook list');
        console.error('Error in fetchRulebooks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRulebooks();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch metadata when a rulebook ALIAS is selected
  useEffect(() => {
    // Check if an alias is selected
    if (!selectedRulebookAlias) {
        setMetadata(null); // Clear metadata if no alias selected
        setPages([]);      // Clear pages
        return;
    };

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the alias to fetch metadata
        const data = await rulebookService.getRulebookMetadata(selectedRulebookAlias);
        setMetadata(data);
        if (data) {
            // Reset to first page range when changing rulebooks
            setCurrentStartIndex(0);
        } else {
            setError(`Metadata not found for rulebook: ${selectedRulebookAlias}`);
            setPages([]); // Clear pages if metadata fails
        }
      } catch (err: any) {
        setError(`Failed to load metadata for ${selectedRulebookAlias}: ${err.message || 'Unknown error'}`);
        console.error(err);
        setMetadata(null); // Clear metadata on error
        setPages([]);      // Clear pages on error
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
    // Depend on the selected alias
  }, [selectedRulebookAlias]);

  // Fetch pages when start index changes or metadata becomes available (implies rulebook changed)
  useEffect(() => {
    // Ensure we have valid metadata AND an alias selected before fetching pages
    if (!selectedRulebookAlias || !metadata) {
        setPages([]); // Clear pages if no metadata or alias
        return;
    }

    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the alias to fetch pages
        const data = await rulebookService.getRulebookPages(
          selectedRulebookAlias,
          currentStartIndex,
          PAGES_PER_VIEW
        );
        if (data) {
            setPages(data.pages);
        } else {
             setError(`Pages not found for rulebook: ${selectedRulebookAlias}`);
             setPages([]); // Clear pages if fetch fails
        }
      } catch (err: any) {
        setError(`Failed to load pages for ${selectedRulebookAlias}: ${err.message || 'Unknown error'}`);
        console.error(err);
        setPages([]); // Clear pages on error
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
    // Depend on the selected alias AND the current start index
    // We don't strictly need 'metadata' here, as the alias change covers the rulebook switch,
    // but including it ensures we only fetch pages once valid metadata is loaded for the selected alias.
  }, [selectedRulebookAlias, currentStartIndex, metadata]);

  // Calculate page navigation ranges - NO CHANGE NEEDED HERE
  const calculatePageRanges = () => {
    if (!metadata) return [];

    const pageRanges = [];
    // Prevent division by zero or negative counts
    const totalValidPages = Math.max(0, metadata.pageCount);
    if (totalValidPages === 0) return [];

    const totalRanges = Math.ceil(totalValidPages / PAGES_PER_VIEW);

    for (let i = 0; i < totalRanges; i++) {
      const rangeStartIdx = i * PAGES_PER_VIEW;
      // Ensure end index doesn't exceed actual page count
      const rangeEndIdx = Math.min(rangeStartIdx + PAGES_PER_VIEW - 1, totalValidPages - 1);

      // Check if firstPageIndex is valid before using it
      const startPage = (metadata.firstPageIndex >= 0 ? metadata.firstPageIndex : 0) + rangeStartIdx;
      const endPage = (metadata.firstPageIndex >= 0 ? metadata.firstPageIndex : 0) + rangeEndIdx;

      pageRanges.push({
        rangeStart: rangeStartIdx, // This is the 0-based index within the Pages array
        displayText: `[${startPage}-${endPage}]`, // Display user-friendly page numbers
        isCurrent: rangeStartIdx === currentStartIndex
      });
    }

    return pageRanges;
  };

  const handleRulebookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Set the selected ALIAS from the dropdown value
    setSelectedRulebookAlias(e.target.value);
  };

  const handleRangeClick = (startIndex: number) => {
    setCurrentStartIndex(startIndex);
  };

  const handlePrevious = () => {
    // Calculate previous index safely
    const prevStartIndex = Math.max(0, currentStartIndex - PAGES_PER_VIEW);
    if (prevStartIndex !== currentStartIndex) {
        setCurrentStartIndex(prevStartIndex);
    }
  };

  const handleNext = () => {
    if (metadata && currentStartIndex + PAGES_PER_VIEW < metadata.pageCount) {
      setCurrentStartIndex(currentStartIndex + PAGES_PER_VIEW);
    }
  };

  const pageRanges = calculatePageRanges();
  const hasPrevious = currentStartIndex > 0; // Simpler check: can go back if not at the very start
  const hasNext = metadata ? currentStartIndex + PAGES_PER_VIEW < metadata.pageCount : false;

  return (
    <div className="encyclopedia-container">
      <h2>Rogue Trader Encyclopedia</h2>

      <div className="rulebook-selector">
        <label htmlFor="rulebook-select">Select Rulebook:</label>
        <select
          id="rulebook-select"
          // Value is the selected alias
          value={selectedRulebookAlias}
          onChange={handleRulebookChange}
          disabled={loading || rulebooks.length === 0}
        >
          {/* Map over RulebookInfo objects */}
          {rulebooks.map(bookInfo => (
            // Key and value should be the unique alias
            <option key={bookInfo.alias} value={bookInfo.alias}>
              {/* Display the user-friendly name */}
              {bookInfo.displayName}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading-indicator">Loading...</div>}

      {!loading && !error && selectedRulebookAlias && ( // Only show content area if not loading, no error, and a book is selected
        <>
          <div className="pages-container">
            {pages.length > 0 ? pages.map((page) => (
              <div key={`${selectedRulebookAlias}-${page.pageIndex}`} className="page"> {/* More robust key */}
                <div className="page-content">
                  {/* Handle potential undefined/null text gracefully */}
                  {(page.text || '').split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph || '\u00A0'}</p> // Use non-breaking space for empty paragraphs
                  ))}
                </div>
                <div className="page-counter">Page {page.pageIndex}</div>
              </div>
            )) : (
                !metadata && <div>Select a rulebook to view pages.</div> // Show prompt if no metadata yet
            )}
          </div>

          {metadata && metadata.pageCount > 0 && ( // Only show nav if there are pages
              <div className="navigation-controls">
                <button
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className="nav-button"
                >
                  Previous
                </button>

                <div className="page-range-buttons">
                  {pageRanges.map((range, index) => (
                    <button
                      key={`${selectedRulebookAlias}-range-${index}`} // More robust key
                      onClick={() => handleRangeClick(range.rangeStart)}
                      className={range.isCurrent ? 'page-range active-range' : 'page-range'}
                      title={`Load pages starting from index ${range.rangeStart}`} // Tooltip for clarity
                    >
                      {range.displayText}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="nav-button"
                >
                  Next
                </button>
              </div>
          )}
        </>
      )}
       {!loading && !selectedRulebookAlias && rulebooks.length > 0 && (
            <div>Please select a rulebook from the dropdown.</div> // Prompt if books loaded but none selected yet
       )}
    </div>
  );
}