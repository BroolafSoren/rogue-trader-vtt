import { Stage, Layer, Circle, Rect, Line } from 'react-konva';
import { useTokenStore } from '../stores/useTokenStore';
import { useEffect } from 'react';
import { connection } from '../services/connectionService';

const CELL_SIZE = 50;
const GRID_SIZE = 20;

export default function MapCanvas() {
  const { tokens, selectedToken, setTokens, addWaypoint, localTokenPos } = useTokenStore();

  // Sync tokens with server
  useEffect(() => {
    connection.on('tokens-update', (serverTokens) => {
      setTokens(serverTokens);
    });
  }, []);
  
  useEffect(() => {
    connection.on('token-created', (newToken) => {
      useTokenStore.getState().addToken(newToken);
    });
  }, []);

  useEffect(() => {
    return () => {
      useTokenStore.getState().setLocalTokenPos(null);
    };
  }, []);

  // Handle right-click for waypoints
  const handleGridRightClick = (e: any) => {
    e.evt.preventDefault();
    if (!selectedToken) return;

    const pos = {
      x: Math.floor(e.evt.layerX / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2,
      y: Math.floor(e.evt.layerY / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2,
    };

    addWaypoint(selectedToken, pos);

    const updatedTokens = useTokenStore.getState().tokens;
    const updatedToken = updatedTokens.find(t => t.id === selectedToken);

    if (updatedToken) {
        // Use SignalR's invoke method
        connection.invoke('MoveToken', updatedToken);
    }
  };

  return (
    <Stage 
      width={CELL_SIZE * GRID_SIZE} 
      height={CELL_SIZE * GRID_SIZE}
      onContextMenu={handleGridRightClick}
    >
      <Layer>
        {/* Grid */}
        {[...Array(GRID_SIZE)].map((_, i) => (
          [...Array(GRID_SIZE)].map((_, j) => (
            <Rect
              key={`${i}-${j}`}
              x={i * CELL_SIZE}
              y={j * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              stroke="#ddd"
            />
          ))
        ))}

        {/* Tokens */}
        {tokens.map((token) => (
          <Circle
            key={token.id}
            x={localTokenPos?.id === token.id ? localTokenPos.x : token.x}
            y={localTokenPos?.id === token.id ? localTokenPos.y : token.y}
            radius={20}
            fill={token.color}
            onClick={() => useTokenStore.getState().selectToken(token.id)}
          />
        ))}

        {/* Waypoints */}
        {tokens.map((token) =>
          token.waypoints?.map((waypoint, index) => {
            const startPoint = index === 0 
              ? { x: token.x, y: token.y } 
              : token.waypoints[index - 1];
            return (
              <Line
                key={`${token.id}-${index}`}
                points={[
                  startPoint.x,
                  startPoint.y,
                  waypoint.x,
                  waypoint.y
                ]}
                stroke="yellow"
                dash={[10, 5]}
              />
            );
          })
        )}
      </Layer>
    </Stage>
  );
}