/* src/app/page.jsx */
"use client";
import React from 'react';
import '../styles/home.css';

export default function HomePage() {
  return (
    <>
      {/* NOTE: The <Header /> is now in layout.js 
        It will automatically appear above this section.
      */}

      {/* 1. Hero Section */}
      <header className="hero-split">
        <div className="hero-content">
          <span className="overline">Est. 2024 • Jaipur, India</span>
          <h1>Tribal Art,<br/>Reimagined for<br/>Modern Life.</h1>
          <p>
            We blend heritage with minimal design. 
            Experience a collection that is culturally rooted, refined, and consciously crafted.
          </p>
          <div>
            <a href="#collections" className="btn-editorial">Explore Collections</a>
          </div>
        </div>
        <div className="hero-visual">
          {/* Background Image is handled in src/styles/home.css */}
        </div>
      </header>

      {/* 2. Collections Section */}
      <section id="collections" className="collections-split">
        
        <div className="collection-block">
          <div className="collection-bg bg-main"></div>
          <div className="collection-info">
            <span className="overline" style={{color: '#fff'}}>Everyday Wear</span>
            <h3>Main Products</h3>
            <p>Shirts, Trousers & Layers</p>
            <a href="#" className="btn-editorial" style={{borderColor: '#fff', color: '#fff'}}>Shop Now</a>
          </div>
        </div>

        <div className="collection-block">
          <div className="collection-bg bg-archive"></div>
          <div className="collection-info">
            <span className="overline" style={{color: '#fff'}}>Limited Drops</span>
            <h3>The Archives</h3>
            <p>Curated Lifestyle Narratives</p>
            <a href="#" className="btn-editorial" style={{borderColor: '#fff', color: '#fff'}}>View Drops</a>
          </div>
        </div>

      </section>

      {/* 3. Ethos / About Section */}
      <section id="about" className="container ethos-section">
        <div className="ethos-grid">
          <div className="ethos-image">
            <img 
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop" 
              alt="Fabric Detail" 
              style={{width: '100%'}} 
            />
          </div>
          <div className="ethos-text">
            <span className="overline">Our Philosophy</span>
            <h2>Cultural Depth,<br/>Minimal Design.</h2>
            <p>
              Costerbox is not just a brand; it is a bridge between the past and the present. 
              We focus on "Cultural and design research" to bring you products that tell a story.
            </p>
            <p>
              From concept to "Final production and curation", every step is handled with 
              ethical standards and a conscious approach to the environment.
            </p>

            <div className="ethos-details">
              <div className="ethos-item">
                <h5>Eco-Packaging</h5> <p>Minimal and eco-conscious packaging for every order.</p>
              </div>
              <div className="ethos-item">
                <h5>Handcrafted</h5> <p>Inspired by aged fabric, sunlit clay, and muted tones.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Founders Section */}
      <section className="founders-section">
        <div className="container">
          <div className="founders-card">
            <h3>Built on Vision & Integrity</h3>
            <p style={{marginTop: '20px', fontStyle: 'italic', color: '#555'}}>
              "To build a culturally rooted yet modern brand that presents traditional art forms in an elegant, refined, and relevant way."
            </p>
            
            <div className="founders-names">
              
              <div className="founder-profile">
                {/* Ensure you have this image in public/founder1.jpg later */}
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop" 
                  alt="Sumit K. Soni" 
                  className="founder-img" 
                />
                <div className="founder-info">
                  <strong>Sumit K. Soni</strong>
                  <span>Founder & CEO</span>
                </div>
              </div>

              <div className="founder-profile">
                {/* Ensure you have this image in public/founder2.jpg later */}
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop" 
                  alt="Sukhadev Dewasi" 
                  className="founder-img" 
                />
                <div className="founder-info">
                  <strong>Sukhadev Dewasi</strong>
                  <span>Co-Founder & CFO</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* NOTE: The <Footer /> is now in layout.js 
        It will automatically appear below this section.
      */}
    </>
  );
}