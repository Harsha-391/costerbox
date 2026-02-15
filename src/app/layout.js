/* src/app/layout.js */
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PromoStrip from '../components/PromoStrip';

export const metadata = {
  title: 'Costerbox',
  description: 'Tribal Art, Reimagined.',
};

import { CartProvider } from '../context/CartContext';

import { WishlistProvider } from '../context/WishlistContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {/* 0. Promo Strip — above header */}
              <PromoStrip />

              {/* 1. Header is now global */}
              <Header />

              {/* 2. Main Content */}
              <div style={{ minHeight: '80vh' }}>
                {children}
              </div>

              {/* 3. Footer is now global */}
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}