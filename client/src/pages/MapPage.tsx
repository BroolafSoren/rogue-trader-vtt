import MapCanvas from '../components/MapCanvas';
import MovementControls from '../components/MovementControls';
import { useTokenStore } from '../stores/useTokenStore';
import { v4 as uuidv4 } from 'uuid'; 
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function MapPage() {
    const { tokens, addToken } = useTokenStore();

    const handleCreateToken = () => {
        const newToken = {
            id: uuidv4(),
            x: (50 * 20) / 2,
            y: (50 * 20) / 2,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
            waypoints: [],
        };

        addToken(newToken);
        socket.emit('create-token', newToken);
    };
  return (
    <div>
      <h2>Map View</h2>
        <button onClick={handleCreateToken}>Create Token</button>
        <MovementControls socket={socket} />
        <MapCanvas />
        <div>Tokens: {tokens.length}</div>
    </div>
  );
}