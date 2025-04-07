import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../stores/useWindowStore';
import '../styles/FloatingWindow.css';

interface FloatingWindowProps {
  window: any;
  children: React.ReactNode;
}

export default function FloatingWindow({ window: windowState, children }: FloatingWindowProps) {
  const { closeWindow, updatePosition } = useWindowStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && 
        (e.target.closest('.window-header-actions') || 
         e.target.classList.contains('resize-handle'))) {
      return;
    }
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Handle mouse events for both dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updatePosition(windowState.id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing && resizeDirection) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;
        
        const newPosition = { ...windowState.position };
        
        if (resizeDirection.includes('e')) {
          newPosition.width = Math.max(200, windowState.position.width + deltaX);
        }
        if (resizeDirection.includes('s')) {
          newPosition.height = Math.max(150, windowState.position.height + deltaY);
        }
        if (resizeDirection.includes('w')) {
          const newWidth = Math.max(200, windowState.position.width - deltaX);
          newPosition.x = windowState.position.x + (windowState.position.width - newWidth);
          newPosition.width = newWidth;
        }
        if (resizeDirection.includes('n')) {
          const newHeight = Math.max(150, windowState.position.height - deltaY);
          newPosition.y = windowState.position.y + (windowState.position.height - newHeight);
          newPosition.height = newHeight;
        }
        
        updatePosition(windowState.id, newPosition);
        setDragOffset({
          x: e.clientX,
          y: e.clientY
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, windowState.id, windowState.position, resizeDirection, updatePosition]);

  return (
    <div 
      className={`window-container ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.position.width}px`,
        height: `${windowState.position.height}px`
      }}
      ref={windowRef}
      data-window-id={windowState.id}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="window-title">{windowState.title}</div>
        <div className="window-header-actions">
          <button 
            className="window-close-button"
            onClick={() => closeWindow(windowState.id)}
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="window-content" ref={contentRef}>
        {children}
      </div>
      
      {/* Resize handles */}
      <div className="resize-handle resize-n" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
      <div className="resize-handle resize-e" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
      <div className="resize-handle resize-s" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
      <div className="resize-handle resize-w" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
      <div className="resize-handle resize-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
      <div className="resize-handle resize-se" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
      <div className="resize-handle resize-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
      <div className="resize-handle resize-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
    </div>
  );
}