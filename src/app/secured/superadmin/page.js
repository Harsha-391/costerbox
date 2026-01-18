/* src/app/secured/superadmin/page.js */
"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Sales', value: '₹1,24,500', color: '#4caf50', icon: 'fa-rupee-sign' },
    { label: 'Total Orders', value: '48', color: '#2196f3', icon: 'fa-shopping-bag' },
    { label: 'Active Products', value: '156', color: '#ff9800', icon: 'fa-tshirt' },
    { label: 'Active Artisans', value: '12', color: '#9c27b0', icon: 'fa-hands' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>Dashboard Overview</h1>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat, i) => (
            <div key={i} style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '28px', margin: '0 0 5px 0' }}>{stat.value}</h3>
                    <span style={{ color: '#888', fontSize: '14px' }}>{stat.label}</span>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${stat.color}20`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    <i className={`fas ${stat.icon}`}></i>
                </div>
            </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Recent Activity */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <div>
                            <strong>Order #102{i}</strong> <br/>
                            <small style={{color: '#888'}}>2 mins ago • Via Jodhpur Artisan</small>
                        </div>
                        <span style={{ color: 'green', fontSize: '12px', background: '#e8f5e9', padding: '4px 8px', borderRadius: '4px', height: 'fit-content' }}>Paid</span>
                    </div>
                ))}
            </div>
            <Link href="/secured/superadmin/orders" style={{ display: 'block', marginTop: '20px', color: 'blue', textDecoration: 'underline' }}>View All Orders</Link>
        </div>

        {/* Shortcuts */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <Link href="/secured/superadmin/add-product" style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', borderRadius: '6px', color: '#333', textDecoration: 'none' }}>
                    <i className="fas fa-plus" style={{display: 'block', fontSize: '24px', marginBottom: '10px'}}></i>
                    Add Product
                </Link>
                <Link href="/secured/superadmin/manage-artisans" style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', borderRadius: '6px', color: '#333', textDecoration: 'none' }}>
                    <i className="fas fa-user-plus" style={{display: 'block', fontSize: '24px', marginBottom: '10px'}}></i>
                    Add Artisan
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}