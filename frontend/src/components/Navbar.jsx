import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ dark, setDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function isActive(path) {
    if (path === '/loans') {
      return location.pathname === '/loans';
    }
    return location.pathname === path;
  }

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <h2 className="navbar-brand">FintechFlow</h2>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          Menu
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link className={isActive('/wallet') ? 'active' : ''} to="/wallet" onClick={() => setMenuOpen(false)}>
          Wallet
        </Link>
        <Link className={isActive('/transactions') ? 'active' : ''} to="/transactions" onClick={() => setMenuOpen(false)}>
          Transactions
        </Link>
        <Link className={isActive('/loans/apply') ? 'active' : ''} to="/loans/apply" onClick={() => setMenuOpen(false)}>
          Apply Loan
        </Link>
        <Link className={isActive('/loans') ? 'active' : ''} to="/loans" onClick={() => setMenuOpen(false)}>
          Loan Status
        </Link>
        <Link className={isActive('/emi') ? 'active' : ''} to="/emi" onClick={() => setMenuOpen(false)}>
          EMI
        </Link>
        <button type="button" onClick={() => setDark(!dark)}>
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
