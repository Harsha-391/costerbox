/* src/app/secured/superadmin/layout.js */
"use client";
import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext'; // Adjust path if needed
import { useRouter } from 'next/navigation';

export default function SuperAdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Simple protection: if not loading and no user, kick out
  if (!loading && !user) {
    router.push('/secured/login');
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8', fontFamily: 'sans-serif' }}>
      
      {/* --- SIDEBAR --- */}
      <aside style={{ width: '260px', background: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px', flexShrink: 0 }}>
        
        <div style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>COSTERBOX</h2>
          <span style={{ fontSize: '12px', color: '#888' }}>SuperAdmin Panel</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <Link href="/secured/superadmin" style={styles.link}>
             📊 Dashboard
          </Link>

          <Link href="/secured/superadmin/manage-products" style={styles.link}>
             📦 Inventory
          </Link>
          
          <Link href="/secured/superadmin/orders" style={styles.link}>
             🛒 Orders
          </Link>

          {/* 👇 THIS IS THE NEW LINK 👇 */}
          <Link href="/secured/superadmin/team" style={styles.link}>
             🎨 Artisans & Payouts
          </Link>
          
          <Link href="/secured/superadmin/shipping" style={styles.link}>
             🚚 Shipping
          </Link>

          <Link href="/secured/superadmin/manage-artisans" style={styles.link}>
             💬 Live Chats
          </Link>

        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #333' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>Logged in as:</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '30px' }}>
        {children}
      </main>

    </div>
  );
}

const styles = {
  link: {
    textDecoration: 'none',
    color: '#e0e0e0',
    padding: '12px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    transition: '0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
};