// src/components/Footer.jsx
import React from 'react';
import '../styles/footer.css';

export default function Footer() {
  return (
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
  );
}