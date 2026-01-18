/* src/app/secured/superadmin/manage-artisans/page.js */
"use client";
import React, { useState } from 'react';

// Mock Data for Artisans
const MOCK_ARTISANS = [
  { id: 1, name: "Ramesh Kumar", location: "Barmer", activeOrders: 3, pendingPayout: "₹12,000" },
  { id: 2, name: "Sunita Devi", location: "Jodhpur", activeOrders: 1, pendingPayout: "₹4,500" },
];

// Mock Chat Data
const MOCK_CHATS = [
  { sender: 'System', msg: 'Order #1024 Assigned to Ramesh' },
  { sender: 'Ramesh', msg: 'Material received. Starting embroidery tomorrow.' },
  { sender: 'Admin', msg: 'Great, please upload progress photo by Friday.' },
];

export default function ManageArtisans() {
  const [selectedArtisan, setSelectedArtisan] = useState(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', height: '80vh' }}>
      
      {/* LEFT: ARTISAN LIST */}
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '18px' }}>Artisans</h2>
        </div>
        <div style={{ overflowY: 'auto' }}>
            {MOCK_ARTISANS.map(artisan => (
                <div 
                    key={artisan.id} 
                    onClick={() => setSelectedArtisan(artisan)}
                    style={{ 
                        padding: '20px', 
                        borderBottom: '1px solid #f9f9f9', 
                        cursor: 'pointer',
                        background: selectedArtisan?.id === artisan.id ? '#f0f0f0' : '#fff'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{artisan.name}</strong>
                        <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '10px' }}>{artisan.location}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                        Active Orders: {artisan.activeOrders} • Payout: {artisan.pendingPayout}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT: DETAILS & CHAT */}
      <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', display: 'flex', flexDirection: 'column' }}>
        {selectedArtisan ? (
            <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', marginBottom: '5px' }}>{selectedArtisan.name}</h2>
                        <p style={{ color: '#888' }}>ID: ART-{selectedArtisan.id} • {selectedArtisan.location}</p>
                    </div>
                    <button style={{ padding: '8px 15px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>View Profile</button>
                </div>

                {/* Live Order Context */}
                <div style={{ margin: '20px 0', padding: '15px', background: '#fff8e1', borderRadius: '6px', border: '1px solid #ffe082' }}>
                    <strong>Current Focus: Order #1024</strong>
                    <p style={{ fontSize: '13px', margin: '5px 0' }}>Anarkali Set - Yellow - Size M</p>
                    <div style={{ height: '5px', background: '#ccc', borderRadius: '5px', marginTop: '10px', width: '100%' }}>
                        <div style={{ height: '100%', width: '60%', background: '#ff9800', borderRadius: '5px' }}></div>
                    </div>
                    <small style={{ color: '#666' }}>Status: Production (60%)</small>
                </div>

                {/* Chat Interface */}
                <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px' }}>
                        {MOCK_CHATS.map((chat, i) => (
                            <div key={i} style={{ marginBottom: '10px', textAlign: chat.sender === 'Admin' ? 'right' : 'left' }}>
                                <div style={{ 
                                    display: 'inline-block', 
                                    padding: '8px 12px', 
                                    borderRadius: '8px', 
                                    background: chat.sender === 'Admin' ? '#e3f2fd' : '#f5f5f5',
                                    fontSize: '14px'
                                }}>
                                    <strong>{chat.sender}: </strong> {chat.msg}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="Type a message to artisan..." style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <button style={{ padding: '10px 20px', background: 'green', color: '#fff', border: 'none', borderRadius: '4px' }}>Send</button>
                    </div>
                </div>
            </>
        ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                Select an artisan to view details
            </div>
        )}
      </div>

    </div>
  );
}