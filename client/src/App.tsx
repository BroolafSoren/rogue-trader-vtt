import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { startConnection } from './services/connectionService';

import Navbar from './components/Navbar';
import MapPage from './pages/MapPage';
import EncyclopediaPage from './pages/EncyclopediaPage';

function App() {
  // Start connection when app loads
  useEffect(() => {
    startConnection();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/encyclopedia" element={<EncyclopediaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;