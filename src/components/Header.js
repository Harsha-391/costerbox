// src/components/Header.jsx
"use client";
import React from 'react';
import '../styles/header.css'; // We will make this style file next

export default function Header() {
  return (
    <nav className="nav-container">
      <div className="nav-left">
        <a href="/" className="nav-link">Shop</a>
        <a href="#archives" className="nav-link">Archives</a>
      </div>
      
      <div className="brand-logo">
        {/* Ensure 'logo.png' is in your public folder */}
        <img src="/logo.png" alt="Costerbox Logo" className="logo-img" />
      </div>

      <div className="nav-right">
        <a href="#about" className="nav-link">About</a>
        <a href="#contact" className="nav-link">Contact</a>
        <a href="#" className="nav-link"><i className="fas fa-shopping-cart"></i> (0)</a>
      </div>
    </nav>
  );
}