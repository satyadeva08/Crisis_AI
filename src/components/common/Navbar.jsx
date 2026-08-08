import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ variant = 'user' }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isUser = variant === 'user';

  const links = isUser
    ? [
        { path: '/', label: 'Home' },
        { path: '/report', label: 'Report Emergency' },
      ]
    : [];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner container">
        <Link to={isUser ? '/' : '/authority/dashboard'} className="navbar-brand">
          <div className="navbar-logo">
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">DisasterResponse</span>
            <span className="navbar-subtitle">AI</span>
          </div>
        </Link>

        {isUser && (
          <>
            <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/authority/login"
                className="navbar-link navbar-link-authority"
                onClick={() => setMobileMenuOpen(false)}
              >
                Authority Portal
              </Link>
            </div>

            <div className="navbar-actions">
              <Link to="/report" className="navbar-cta">
                Report Emergency
              </Link>
              <button
                className="navbar-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
