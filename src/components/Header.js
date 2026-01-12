// src/components/Header.jsx
"use client";
import React, { useState } from 'react';
import '../styles/header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="nav-wrapper">
      {/* --- TOP BAR (Always Visible) --- */}
      <div className="nav-bar">
        
        {/* 1. Mobile Menu Button (Left) */}
        <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>

        {/* 2. Desktop Left Links (Hidden on Mobile) */}
        <div className="desktop-links-left">
          <a href="/" className="nav-link">Shop</a>
          <a href="#archives" className="nav-link">Archives</a>
        </div>
        
        {/* 3. Logo (Center) */}
        <div className="brand-logo">
          <img src="/logo.png" alt="Costerbox Logo" className="logo-img" />
        </div>

        {/* 4. Desktop Right Links (Hidden on Mobile) */}
        <div className="desktop-links-right">
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="#" className="nav-link"><i className="fas fa-shopping-cart"></i> (0)</a>
        </div>

        {/* 5. Mobile Cart Icon (Right - Only Mobile) */}
        <div className="mobile-cart">
           <a href="#" style={{ color: 'inherit' }}><i className="fas fa-shopping-cart"></i> (0)</a>
        </div>

      </div>

      {/* --- MOBILE EXPANSION MENU (Slide Down) --- */}
      {/* Only visible when isMenuOpen is true AND on mobile */}
      <div className={`mobile-menu-expansion ${isMenuOpen ? 'open' : ''}`}>
        <a href="/" onClick={() => setIsMenuOpen(false)}>Shop</a>
        <a href="#archives" onClick={() => setIsMenuOpen(false)}>Archives</a>
        <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
        <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
      </div>
    </nav>
  );
}