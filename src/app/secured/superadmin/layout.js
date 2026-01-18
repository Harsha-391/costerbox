/* src/app/secured/superadmin/layout.js */
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

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
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '250px', background: '#1a1a1a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          Costerbox Admin
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 15px', borderRadius: '6px',
                textDecoration: 'none',
                color: pathname === link.href ? '#fff' : '#aaa',
                background: pathname === link.href ? '#333' : 'transparent',
                transition: '0.3s'
              }}
            >
              <i className={`fas ${link.icon}`} style={{ width: '20px' }}></i>
              {link.name}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #333' }}>
            <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
                <i className="fas fa-sign-out-alt"></i> Back to Site
            </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>

    </div>
  );
}