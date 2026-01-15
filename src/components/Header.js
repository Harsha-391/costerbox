// src/components/Header.jsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import '../styles/header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="nav-wrapper">
      
      {/* --- OVERLAY (Click to Close) --- */}
      {/* Only visible on mobile when menu is open */}
      <div 
        className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* --- TOP BAR (Always Visible) --- */}
      <div className="nav-bar">
        
        {/* 1. Mobile Menu Button (Left) */}
        <div className="mobile-toggle" onClick={() => setIsMenuOpen(true)}>
          <i className="fas fa-bars"></i>
        </div>

        {/* 2. Desktop Left Links (Hidden on Mobile) */}
        <div className="desktop-links-left">
          <Link href="/" className="nav-link">Shop</Link>
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
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          <a href="#" className="nav-link"><i className="fas fa-shopping-cart"></i> (0)</a>
        </div>

        {/* 5. Mobile Cart Icon (Right - Only Mobile) */}
        <div className="mobile-cart">
           <a href="#" style={{ color: 'inherit' }}><i className="fas fa-shopping-cart"></i> (0)</a>
        </div>

      </div>

      {/* --- MOBILE SIDEBAR MENU (Slide from Left) --- */}
      <div className={`mobile-menu-expansion ${isMenuOpen ? 'open' : ''}`}>
        
        {/* Sidebar Header with Close Button */}
        <div className="mobile-menu-header">
            <span className="menu-title">Menu</span>
            <div className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-times"></i>
            </div>
        </div>

        {/* Sidebar Links */}
        <Link href="/" onClick={() => setIsMenuOpen(false)}>Shop</Link>
        <Link href="/#archives" onClick={() => setIsMenuOpen(false)}>Archives</Link>
        <Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
        <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
      </div>
    </nav>
  );
}