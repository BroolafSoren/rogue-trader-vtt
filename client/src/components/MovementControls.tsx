import { useTokenStore } from '../stores/useTokenStore';
import { useEffect, useState, useRef } from 'react';
import { Animation } from 'konva/lib/Animation';
import { connection } from '../services/connectionService';

export default function MovementControls() {
  const { 
    selectedToken, 
    tokens, 
    removeWaypoints, 
    setLocalTokenPos,
    updateTokenPosition
  } = useTokenStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const handleTokenMoved = (movedToken: any) => {
      setIsAnimating(true);
      const token = tokens.find(t => t.id === movedToken.id);
      if (!token) return;

      // Clear any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Start new animation along waypoints
      const waypoints = token.waypoints;
      let currentWaypointIndex = 0;
      let startX = token.x;
      let startY = token.y;

      const animateToNextWaypoint = () => {
        if (currentWaypointIndex >= waypoints.length) {
          // Update the token's position in the state
          updateTokenPosition(movedToken.id, startX, startY);
          setLocalTokenPos({ id: movedToken.id, x: startX, y: startY });
          setIsAnimating(false);
          removeWaypoints(movedToken.id);
          return;
        }

        const startTime = Date.now();
        const duration = 1000; // 1 second per waypoint
        const nextWaypoint = waypoints[currentWaypointIndex];

        animationRef.current = new Animation((frame) => {
          if (!frame) return;

          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const currentX = startX + (nextWaypoint.x - startX) * progress;
          const currentY = startY + (nextWaypoint.y - startY) * progress;

          setLocalTokenPos({ 
            id: movedToken.id, 
            x: currentX, 
            y: currentY 
          });

          if (progress >= 1) {
            animationRef.current?.stop();
            currentWaypointIndex++;
            startX = nextWaypoint.x;
            startY = nextWaypoint.y;
            animateToNextWaypoint();
          }
        });

        animationRef.current.start();
      };

      animateToNextWaypoint();
    };

    // Use SignalR's on method
    connection.on('token-moved', handleTokenMoved);

    return () => {
      // Use SignalR's off method
      connection.off('token-moved', handleTokenMoved);
      animationRef.current?.stop();
    };
  }, [tokens]);

  const handleConfirmMovement = () => {
    if (!selectedToken) return;
    
    const token = tokens.find(t => t.id === selectedToken);
    if (!token?.waypoints?.length) return;

    const finalPosition = token.waypoints[token.waypoints.length - 1];
    // Use SignalR's invoke method
    connection.invoke('ConfirmMovement', selectedToken, finalPosition.x, finalPosition.y);
  };

  return (
    <div className="movement-controls">
      <button 
        onClick={handleConfirmMovement}
        disabled={!selectedToken || isAnimating}
      >
        {isAnimating ? 'Moving...' : 'Confirm Movement'}
      </button>
    </div>
  );
}