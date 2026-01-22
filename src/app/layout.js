/* src/app/layout.js */
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext'; // <--- IMPORT THIS

export const metadata = {
    title: 'Costerbox',
    description: 'Tribal Art, Reimagined.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <AuthProvider>  {/* <--- WRAP APP WITH PROVIDER */}
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}