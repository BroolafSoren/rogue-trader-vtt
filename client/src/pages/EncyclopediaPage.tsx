import React, { useState, useEffect } from 'react';
import { rulebookService, RulebookPage, RulebookMetadata } from '../services/rulebookService';
import '../styles/EncyclopediaPage.css';

const PAGES_PER_VIEW = 5;

export default function EncyclopediaPage() {
  const [rulebooks, setRulebooks] = useState<string[]>([]);
  const [selectedRulebook, setSelectedRulebook] = useState<string>('');
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
        const books = await rulebookService.getRulebooks();
        console.log('Fetched rulebooks:', books);
        
        setRulebooks(books);
        if (books.length > 0) {
          setSelectedRulebook(books[0]);
        } else {
          setError('No rulebooks found. Check server configuration.');
        }
      } catch (err) {
        setError('Failed to load rulebooks');
        console.error('Error in fetchRulebooks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRulebooks();
  }, []);

  // Fetch metadata when a rulebook is selected
  useEffect(() => {
    if (!selectedRulebook) return;
    
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await rulebookService.getRulebookMetadata(selectedRulebook);
        setMetadata(data);
        // Reset to first page range when changing rulebooks
        setCurrentStartIndex(0);
      } catch (err) {
        setError('Failed to load rulebook metadata');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, [selectedRulebook]);

  // Fetch pages when start index changes or rulebook changes
  useEffect(() => {
    if (!selectedRulebook) return;
    
    const fetchPages = async () => {
      try {
        setLoading(true);
        const data = await rulebookService.getRulebookPages(
          selectedRulebook, 
          currentStartIndex, 
          PAGES_PER_VIEW
        );
        setPages(data.pages);
      } catch (err) {
        setError('Failed to load rulebook pages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPages();
  }, [selectedRulebook, currentStartIndex]);

  // Calculate page navigation ranges
  const calculatePageRanges = () => {
    if (!metadata) return [];
    
    const pageRanges = [];
    const totalRanges = Math.ceil(metadata.pageCount / PAGES_PER_VIEW);
    
    for (let i = 0; i < totalRanges; i++) {
      const startIdx = i * PAGES_PER_VIEW;
      const endIdx = Math.min(startIdx + PAGES_PER_VIEW - 1, metadata.pageCount - 1);
      
      const startPage = metadata.firstPageIndex + startIdx;
      const endPage = metadata.firstPageIndex + endIdx;
      
      pageRanges.push({
        rangeStart: startIdx,
        displayText: `[${startPage}-${endPage}]`,
        isCurrent: startIdx === currentStartIndex
      });
    }
    
    return pageRanges;
  };

  const handleRulebookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRulebook(e.target.value);
  };

  const handleRangeClick = (startIndex: number) => {
    setCurrentStartIndex(startIndex);
  };

  const handlePrevious = () => {
    if (currentStartIndex >= PAGES_PER_VIEW) {
      setCurrentStartIndex(currentStartIndex - PAGES_PER_VIEW);
    }
  };

  const handleNext = () => {
    if (metadata && currentStartIndex + PAGES_PER_VIEW < metadata.pageCount) {
      setCurrentStartIndex(currentStartIndex + PAGES_PER_VIEW);
    }
  };

  const pageRanges = calculatePageRanges();
  const hasPrevious = currentStartIndex >= PAGES_PER_VIEW;
  const hasNext = metadata ? currentStartIndex + PAGES_PER_VIEW < metadata.pageCount : false;

  return (
    <div className="encyclopedia-container">
      <h2>Rogue Trader Encyclopedia</h2>
      
      <div className="rulebook-selector">
        <label htmlFor="rulebook-select">Select Rulebook:</label>
        <select 
          id="rulebook-select" 
          value={selectedRulebook}
          onChange={handleRulebookChange}
          disabled={loading || rulebooks.length === 0}
        >
          {rulebooks.map(book => (
            <option key={book} value={book}>{book}</option>
          ))}
        </select>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <>
          <div className="pages-container">
            {pages.map((page) => (
              <div key={page.pageIndex} className="page">
                <div className="page-content">
                  {page.text.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
                <div className="page-counter">Page {page.pageIndex}</div>
              </div>
            ))}
          </div>
          
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
                  key={index}
                  onClick={() => handleRangeClick(range.rangeStart)}
                  className={range.isCurrent ? 'page-range active-range' : 'page-range'}
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
        </>
      )}
    </div>
  );
}