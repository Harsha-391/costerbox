/* src/app/layout.js */
import '../styles/globals.css';
import Header from '../components/Header'; // Import your new component
import Footer from '../components/Footer'; // Import your new component

export const metadata = {
  title: 'Costerbox | Curated Tribal Modernism',
  description: 'Tribal Art, Reimagined for Modern Life.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
        {/* Font Awesome Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body>
        <Header />  {/* <-- Fixed at the top */}
          {children}  {/* <-- This is where page.jsx loads */}
        <Footer />  {/* <-- Fixed at the bottom */}
      </body>
    </html>
  );
}