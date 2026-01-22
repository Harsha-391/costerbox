/* src/components/Header.js */
"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import '../styles/header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- SEARCH STATES ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const router = useRouter();

  // Handle Search Submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search if clicking outside (Optional)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if clicking outside the header/search area
      if (isSearchOpen && !event.target.closest('.nav-wrapper')) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  return (
    <nav className="nav-wrapper">
      
      {/* --- OVERLAY (Click to Close on Mobile) --- */}
      <div 
        className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* --- MAIN HEADER BAR --- */}
      <div className="nav-bar">
        
        {/* 1. MOBILE HAMBURGER (Left) */}
        <div className="mobile-toggle" onClick={() => setIsMenuOpen(true)}>
          <i className="fas fa-bars"></i>
        </div>

        {/* 2. LOGO (Left on Desktop, Center on Mobile) */}
        <div className="brand-logo">
          <Link href="/">
            <img src="/logo.png" alt="Costerbox Logo" className="logo-img" />
          </Link>
        </div>

        {/* 3. DESKTOP ICONS (Visible ONLY on Desktop) */}
        <div className="desktop-icons">
          
          {/* Desktop Search */}
          <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    ref={searchInputRef}
                />
            </form>
            <div className="icon-link search-trigger" onClick={() => setIsSearchOpen(!isSearchOpen)} title="Search">
                <i className={`fas ${isSearchOpen ? 'fa-times' : 'fa-search'}`}></i>
            </div>
          </div>

          <Link href="/shop" className="icon-link" title="Shop">
            <i className="fas fa-store"></i>
          </Link>
          
          <Link href="/#products" className="icon-link" title="Collections">
            <i className="fas fa-layer-group"></i>
          </Link>

          <Link href="/about" className="icon-link" title="Our Story">
            <i className="fas fa-book-open"></i>
          </Link>

          <Link href="/contact" className="icon-link" title="Contact Us">
            <i className="fas fa-envelope"></i>
          </Link>

          <a href="#" className="icon-link" title="Cart">
            <i className="fas fa-shopping-cart"></i> (0)
          </a>
        </div>

        {/* 4. MOBILE RIGHT SECTION (Search + Cart) - Visible ONLY on Mobile */}
        <div className="mobile-right-section">
            {/* Mobile Search Icon Trigger */}
            <div className="mobile-search-trigger" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <i className={`fas ${isSearchOpen ? 'fa-times' : 'fa-search'}`}></i>
            </div>

            {/* Mobile Cart Icon */}
            <a href="#" className="mobile-cart-link">
                <i className="fas fa-shopping-cart"></i> (0)
            </a>
        </div>

      </div>

      {/* --- MOBILE SEARCH BAR DROPDOWN (Visible when search is open) --- */}
      <div className={`mobile-search-bar ${isSearchOpen ? 'open' : ''}`}>
         <form onSubmit={handleSearch}>
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit"><i className="fas fa-arrow-right"></i></button>
         </form>
      </div>

      {/* --- MOBILE SIDEBAR MENU (Slide from Left) --- */}
      <div className={`mobile-menu-expansion ${isMenuOpen ? 'open' : ''}`}>
        
        {/* Sidebar Header */}
        <div className="mobile-menu-header">
            <span className="menu-title">Menu</span>
            <div className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-times"></i>
            </div>
        </div>

        {/* Mobile Links */}
        <Link href="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Shop</Link>
        <Link href="/#products" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Collections</Link>
        <Link href="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>About</Link>
        <Link href="/contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
      </div>
    </nav>
  );
}