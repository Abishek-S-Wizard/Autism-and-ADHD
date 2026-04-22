import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import "../../styles/navbar.css";
import "../../styles/buttons.css"; // Optional if button styles are separate

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we are on landing page
  const isLanding = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' },
    { name: 'Objectives', path: '/#objectives' },
    { name: 'Roles', path: '/#roles' },
    { name: 'How It Works', path: '/#how-it-works' },
  ];

  const handleNavClick = (e, path) => {
    if (isLanding && path.startsWith('/#')) {
      e.preventDefault();
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Link to="/" className="navbar-brand">
          <Activity color="var(--primary)" size={32} />
          <span className="text-gradient">
            Autism & ADHD
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links desktop-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              onClick={(e) => handleNavClick(e, link.path)}
              className="nav-link"
            >
              {link.name}
            </Link>
          ))}
          <div className="nav-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} color="var(--text-primary)" /> : <Menu size={28} color="var(--text-primary)" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="nav-links mobile-only" style={{ display: 'flex', flexDirection: 'column' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              onClick={(e) => handleNavClick(e, link.path)}
              className="nav-link"
            >
              {link.name}
            </Link>
          ))}
          <div className="nav-buttons" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Link to="/login" className="btn btn-primary btn-full">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
