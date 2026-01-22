/* src/app/secured/superadmin/layout.js */
"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, role, loading, logout } = useAuth(); // Added logout here
  const router = useRouter();
  const pathname = usePathname();

  // --- SECURITY CHECK ---
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in? Go to Login.
        router.push('/secured/login');
      } else {
        // Logged in? Check Role.
        if (role !== 'admin') {
            alert("Access Denied: You do not have Admin privileges.");
            router.push('/'); 
        }
      }
    }
  }, [user, role, loading, router]);

  // Loading Screen
  if (loading || role !== 'admin') {
      return (
        <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4', flexDirection: 'column'}}>
            <h2 style={{color: '#333'}}>Verifying Access...</h2>
            <p style={{color: '#666', marginTop: '10px'}}>Checking permissions for {user?.email || 'guest'}</p>
        </div>
      );
  }

  // --- MENU LINKS CONFIGURATION ---
  const links = [
    { name: 'Dashboard', href: '/secured/superadmin', icon: 'fa-chart-line' },
    { name: 'Add Product', href: '/secured/superadmin/add-product', icon: 'fa-plus' },
    { name: 'Inventory', href: '/secured/superadmin/manage-products', icon: 'fa-box' },
    { name: 'Orders', href: '/secured/superadmin/orders', icon: 'fa-shopping-cart' },
    { name: 'Artisans & Chat', href: '/secured/superadmin/manage-artisans', icon: 'fa-users' },
    { name: 'Shipping', href: '/secured/superadmin/shipping', icon: 'fa-truck' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      
      {/* --- SIDEBAR START --- */}
      <aside style={{ width: '250px', background: '#1a1a1a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        
        {/* Logo / Title */}
        <div style={{ marginBottom: '40px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
          Costerbox Admin
        </div>
        
        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 15px', borderRadius: '6px',
                textDecoration: 'none',
                color: pathname === link.href ? '#fff' : '#aaa', // Active state color
                background: pathname === link.href ? '#333' : 'transparent', // Active state bg
                transition: '0.3s'
              }}
            >
              <i className={`fas ${link.icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <button 
                onClick={() => { logout(); router.push('/secured/login'); }}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#ff5252', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '14px',
                    padding: '10px'
                }}
            >
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
      </aside>
      {/* --- SIDEBAR END --- */}

      {/* --- MAIN CONTENT --- */}
      {/* We add marginLeft: '250px' so the content doesn't hide behind the fixed sidebar */}
      <main style={{ flex: 1, padding: '40px', marginLeft: '250px' }}>
        {children}
      </main>

    </div>
  );
}