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
      x: (50 * 20) / 2,
      y: (50 * 20) / 2,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      waypoints: [],
    };
    addToken(newToken);
    socket.emit('create-token', newToken);
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