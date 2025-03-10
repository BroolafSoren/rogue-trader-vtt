import { Stage, Layer, Circle, Rect, Line } from 'react-konva';
import { useTokenStore } from '../stores/useTokenStore';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const CELL_SIZE = 50;
const GRID_SIZE = 20;

const socket = io('http://localhost:3000');

export default function MapCanvas() {
  const { tokens, selectedToken, setTokens, addWaypoint } = useTokenStore();

  // Sync tokens with server
  useEffect(() => {
    socket.on('tokens-update', (serverTokens) => {
      setTokens(serverTokens);
    });
  }, []);
  useEffect(() => {
    socket.on('token-created', (newToken) => {
      useTokenStore.getState().addToken(newToken);
    });
  }, []);

  // Handle right-click for waypoints
  const handleGridRightClick = (e: any) => {
    e.evt.preventDefault();
    if (!selectedToken) return;

    const pos = {
      x: Math.floor(e.evt.layerX / CELL_SIZE) * CELL_SIZE,
      y: Math.floor(e.evt.layerY / CELL_SIZE) * CELL_SIZE,
    };

    addWaypoint(selectedToken, pos);
    socket.emit('move-token', tokens.find(t => t.id === selectedToken));
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
            x={token.x}
            y={token.y}
            radius={20}
            fill={token.color}
            onClick={() => useTokenStore.getState().selectToken(token.id)}
          />
        ))}

        {/* Waypoints */}
        {tokens.map((token) => (
          token.waypoints?.map((waypoint, i) => (
            <Line
              key={`${token.id}-${i}`}
              points={[
                token.x + (i === 0 ? 0 : token.waypoints![i-1].x),
                token.y + (i === 0 ? 0 : token.waypoints![i-1].y),
                waypoint.x,
                waypoint.y
              ]}
              stroke="yellow"
            />
          ))
        ))}
      </Layer>
    </Stage>
  );
}