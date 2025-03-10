import './App.css';
import MapCanvas from './components/MapCanvas';
import { useTokenStore } from './stores/useTokenStore';
import { v4 as uuidv4 } from 'uuid'; 
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const { tokens, addToken } = useTokenStore();

  const handleCreateToken = () => {
    const newToken = {
      id: uuidv4(),
      x: 250, // Center of a 500x500 grid (CELL_SIZE * GRID_SIZE)
      y: 250,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
    };
    addToken(newToken);
    socket.emit('create-token', newToken); // Add this line
  };

  return (
    <div className="App">
      <h1>Rogue Trader VTT</h1>
      <button onClick={handleCreateToken}>Create Token</button>
      <MapCanvas />
      <div>Tokens: {tokens.length}</div>
    </div>
  );
}

export default App;