import React from 'react';
import '../styles/footer.css';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact">
      <div className="footer-container">

        {/* TOP COLUMNS */}
        <div className="footer-top">

          {/* Column 1 */}
          <div className="footer-col">
            <h4>Need Help</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/shipping-policy">Shipping Policy</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h4>Useful Links</h4>
            <ul>
              <li><a href="/about">Costerbox Stories</a></li>
              <li><a href="/orders">Track Your Order</a></li>
              <li><a href="/faqs">FAQs</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/sitemap">Site Map</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h4>MORE INFO</h4>
            <ul>
              <li><a href="/our-family">Our Family</a></li>
              <li><a href="/custom/bespoke">Create Your Own</a></li>
              <li><a href="/custom/upcycle">Upcycled</a></li>

            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-col contact-col">
            <h4>Contact</h4>
            <p>
              <MapPin size={16} style={{ marginRight: '8px', display: 'inline', minWidth: '16px' }} />
              <span>Bhamashah Techno Hub, Sansthan Path, Jhalana Gram, Malviya Nagar, Jaipur, Rajasthan 302017</span>
            </p>
            <p>
              <Mail size={16} style={{ marginRight: '8px', display: 'inline' }} />
              <a href="mailto:support@costerbox.in">support@costerbox.in</a>
            </p>
            <p>
              <Phone size={16} style={{ marginRight: '8px', display: 'inline' }} />
              <a href="tel:+916377515507">+91 6377515507</a>
            </p>
          </div>

        </div>

        {/* MIDDLE ROW (Payment & Social) */}
        <div className="footer-middle">

          <div className="footer-payment">
            <h4>100% Secure Payment</h4>
            <div className="payment-icons">
              {/* Using placeholder images or text for payment icons as requested "like this" */}
              <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" title="Visa" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="PayPal" title="PayPal" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" title="Mastercard" />
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968299.png" alt="UPI" title="UPI" />
            </div>
          </div>

          <div className="footer-social">
            <h4>Let's Be Friends</h4>
            <div className="social-icons">
              <a href="https://www.linkedin.com/company/costerbox/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://x.com/costerbox" target="_blank" rel="noopener noreferrer"><i className="fab fa-x-twitter"></i></a>
              <a href="https://m.facebook.com/costerbox/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="https://pin.it/3VQqJlQyT" target="_blank" rel="noopener noreferrer"><i className="fab fa-pinterest-p"></i></a>
              <a href="https://wa.me/+916377515507" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="footer-bottom">
        <p>Copyright © 2024 Costerbox Pvt Ltd. All rights reserved</p>
      </div>
    </footer>
  );
}