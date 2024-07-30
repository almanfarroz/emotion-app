import React, { useEffect, useState } from 'react';
import './navbar.css';

interface NavbarProps {
  handleScanClick: () => void;
  handleQAClick: () => void;
  handleHomeClick: () => void;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handleScanClick, handleQAClick, handleHomeClick, handleLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`navbar py-4 flex ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'active' : ''}`}>
      <div className="logo-container">
      <button onClick={handleHomeClick}><img className="logo" src="images/logo2.png" alt="logo" /></button>
      </div>
      <div className="burger" onClick={toggleMenu}>
        <div />
        <div />
        <div />
      </div>
      <div className={`navbar-links-container ${isMenuOpen ? 'responsive' : ''}`}>
        <ul className={`nav-links ${isMenuOpen ? 'responsive show' : ''}`}>
          <li>
            <button onClick={handleHomeClick}>Home</button>
          </li>
          <li>
            <button onClick={handleScanClick}>Scan</button>
          </li>
          <li>
            <button onClick={handleQAClick}>QA</button>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
