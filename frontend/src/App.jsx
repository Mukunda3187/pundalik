import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ChartResult from './pages/ChartResult.jsx';
import Compatibility from './pages/Compatibility.jsx';

function Header() {
  const location = useLocation();
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-mark">Pundalik</span>
          <span className="brand-sub">Vedic Astrology</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Your Chart</Link>
          <Link to="/compatibility" className={location.pathname === '/compatibility' ? 'active' : ''}>Compatibility</Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chart" element={<ChartResult />} />
        <Route path="/compatibility" element={<Compatibility />} />
      </Routes>
    </HashRouter>
  );
}
