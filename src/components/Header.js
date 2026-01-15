// src/components/Header.jsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link'; // 1. Import Next.js Link
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
          {/* Use Link for internal pages */}
          <Link href="/" className="nav-link">Shop</Link>
          
          {/* Use /#id for sections on the Homepage so they work from the About page */}
          <Link href="/#archives" className="nav-link">Archives</Link>
        </div>
        
        {/* 3. Logo (Center) */}
        <div className="brand-logo">
          <Link href="/">
            <img src="/logo.png" alt="Costerbox Logo" className="logo-img" />
          </Link>
        </div>

        {/* 4. Desktop Right Links (Hidden on Mobile) */}
        <div className="desktop-links-right">
          {/* LINK TO YOUR NEW ABOUT PAGE */}
          <Link href="/about" className="nav-link">About</Link>
          
         <Link href="/contact" className="nav-link">Contact</Link>
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
        <Link href="/" onClick={() => setIsMenuOpen(false)}>Shop</Link>
        <Link href="/#archives" onClick={() => setIsMenuOpen(false)}>Archives</Link>
        
        {/* Mobile About Link */}
        <Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
        
        <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
      </div>
    </nav>
  );
}