/* src/app/secured/superadmin/shipping/page.js */
"use client";
import React, { useState } from 'react';

export default function ShippingPage() {
  // Mock Data
  const [shipments, setShipments] = useState([
    { id: '#SHP-001', order: '#ORD-7783', customer: 'Rahul K.', courier: 'Delhivery', awb: '1234567890', status: 'In Transit', location: 'Jaipur Hub' },
    { id: '#SHP-002', order: '#ORD-7780', customer: 'Sita D.', courier: 'BlueDart', awb: '0987654321', status: 'Delivered', location: 'Mumbai' },
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Logistics & Shipping</h1>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={styles.card}>
            <h3>Ready to Ship</h3>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>5</div>
        </div>
        <div style={styles.card}>
            <h3>In Transit</h3>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#f9a825'}}>12</div>
        </div>
        <div style={styles.card}>
            <h3>Delivered (This Week)</h3>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: '#1e8e3e'}}>48</div>
        </div>
      </div>

      {/* Main Shipping Table */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '15px' }}>Active Shipments</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px' }}>Shipment ID</th>
                    <th style={{ padding: '10px' }}>Order Ref</th>
                    <th style={{ padding: '10px' }}>Courier</th>
                    <th style={{ padding: '10px' }}>AWB / Tracking</th>
                    <th style={{ padding: '10px' }}>Current Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {shipments.map(ship => (
                    <tr key={ship.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '15px' }}>{ship.id}</td>
                        <td style={{ padding: '15px' }}>{ship.order}<br/><small>{ship.customer}</small></td>
                        <td style={{ padding: '15px' }}>{ship.courier}</td>
                        <td style={{ padding: '15px', fontFamily: 'monospace' }}>{ship.awb}</td>
                        <td style={{ padding: '15px' }}>
                            <span style={{ 
                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                background: ship.status === 'Delivered' ? '#e6f4ea' : '#fff3e0',
                                color: ship.status === 'Delivered' ? 'green' : 'orange'
                            }}>
                                {ship.status}
                            </span>
                            <div style={{fontSize:'10px', marginTop:'5px'}}>{ship.location}</div>
                        </td>
                        <td style={{ padding: '15px' }}>
                            <button style={{ border: '1px solid #ddd', background: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Track</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
    card: { flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
};