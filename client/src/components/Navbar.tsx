import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Rogue Trader VTT</div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Map</Link>
        </li>
        <li>
          <Link to="/encyclopedia">Encyclopedia</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;