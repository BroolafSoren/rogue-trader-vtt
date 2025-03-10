import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import MapPage from './pages/MapPage';
import EncyclopediaPage from './pages/EncyclopediaPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* If you open "/", you'll see the map */}
        <Route path="/" element={<MapPage />} />

        {/* If you open "/encyclopedia", you'll see the encyclopedia */}
        <Route path="/encyclopedia" element={<EncyclopediaPage />} />

        {/* Add more <Route> elements here for additional pages */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;