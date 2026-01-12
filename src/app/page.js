/* src/app/page.jsx */
"use client";
import React from 'react';
import '../styles/home.css'; // Importing your design

export default function HomePage() {
  return (
    <>
      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-left">
          <a href="#shop" className="nav-link">Shop</a>
          <a href="#archives" className="nav-link">Archives</a>
        </div>
        
        <div className="brand-logo">
          Costerbox
        </div>

        <div className="nav-right">
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="#" className="nav-link"><i className="fas fa-shopping-cart"></i> (0)</a>
        </div>
      </nav>

      {/* Hero Section */}
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
          {/* Background Image handled in CSS */}
        </div>
      </header>

      {/* Collection Selector */}
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

      {/* Ethos Section */}
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

      {/* Founders Section */}
      <section className="founders-section">
        <div className="container">
          <div className="founders-card">
            <h3>Built on Vision & Integrity</h3>
            <p style={{marginTop: '20px', fontStyle: 'italic'}}>
              "To build a culturally rooted yet modern brand that presents traditional art forms in an elegant, refined, and relevant way."
            </p>
            
            <div className="founders-names">
              <div className="founder">
                <strong>Sumit K. Soni</strong>
                <span>Founder & CEO</span>
              </div>
              <div className="founder">
                <strong>Sukhadev Dewasi</strong>
                <span>Co-Founder & CFO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact">
        <div className="footer-content">
          
          <div className="footer-brand">
            <h2>Costerbox</h2>
            <p>Reinterpreting traditional tribal and folk art into contemporary products.</p>
          </div>

          <div className="footer-links">
            <h4>Customer Care</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping & Returns</a></li> 
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Sizing Guide</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Connect</h4>
            <div className="contact-info">
              <p><i className="fas fa-map-marker-alt"></i> Bhamashah Techno Hub, Jaipur</p> 
              <p><i className="fas fa-phone"></i> +91 63775 15507</p> 
              <p><i className="fas fa-envelope"></i> support@costerbox.in</p> 
            </div>
          </div>

          <div className="footer-links">
            <h4>Social</h4>
            <ul>
              <li><a href="https://instagram.com/costerbox">Instagram</a></li> 
              <li><a href="#">WhatsApp</a></li> 
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <span>&copy; 2024 Costerbox Private Limited.</span> 
          <span>Designed for Premium Utility</span>
        </div>
      </footer>
    </>
  );
}