/* src/app/secured/superadmin/team/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, query, where } from 'firebase/firestore';

export default function TeamPage() {
  const [artisans, setArtisans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  
  // FORM STATE
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialty: 'Zari Specialist'
  });

  // 1. FETCH ARTISANS & ORDERS
  useEffect(() => {
    // Get Users who are 'artisan'
    const qUsers = query(collection(db, "users"), where("role", "==", "artisan"));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
       setArtisans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Get ALL Orders (to calculate payouts)
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
       setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUsers(); unsubOrders(); };
  }, []);

  // 2. ADD ARTISAN FUNCTION
  const handleRegister = async () => {
    if(!formData.email || !formData.name) return alert("Name/Email required");
    try {
      await setDoc(doc(db, "users", formData.email), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'artisan',
        specialty: formData.specialty,
        createdAt: new Date()
      });
      alert("✅ Artisan Added!");
      setFormData({ name: '', email: '', phone: '', specialty: 'Zari Specialist' });
      setActiveTab('list'); // Switch back to list view
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. PAYOUT CALCULATOR HELPER
  const calculatePayout = (artisanEmail) => {
    // Find all orders completed by this artisan
    const artisanOrders = orders.filter(o => 
        o.assignedArtisan === artisanEmail && 
        (o.status === 'Done' || o.status === 'Shipped') // Only pay for completed work
    );

    const totalSales = artisanOrders.reduce((sum, order) => sum + (Number(order.price) || 0), 0);
    const payout = totalSales * 0.20; // 20% Calculation

    return { 
        count: artisanOrders.length, 
        sales: totalSales, 
        payout: payout 
    };
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER & TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Manage Team & Payouts</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                onClick={() => setActiveTab('list')}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'list' ? '#1a1a1a' : '#ddd', color: activeTab === 'list' ? '#fff' : '#000' }}
            >
                View Team
            </button>
            <button 
                onClick={() => setActiveTab('add')}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'add' ? '#1a1a1a' : '#ddd', color: activeTab === 'add' ? '#fff' : '#000' }}
            >
                + Add Artisan
            </button>
        </div>
      </div>

      {/* VIEW 1: ADD ARTISAN FORM */}
      {activeTab === 'add' && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: '20px' }}>Register New Artist</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={styles.label}>Name</label>
                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} />
                </div>
                <div>
                    <label style={styles.label}>Email (Login ID)</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.input} />
                </div>
                <div>
                    <label style={styles.label}>Phone</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.input} />
                </div>
                <div>
                    <label style={styles.label}>Specialty</label>
                    <select value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} style={styles.input}>
                        <option>Zari Specialist</option>
                        <option>Aari Artist</option>
                        <option>Hand Stitching</option>
                        <option>Finishing</option>
                    </select>
                </div>
            </div>
            <button onClick={handleRegister} style={styles.saveBtn}>Create Account</button>
          </div>
      )}

      {/* VIEW 2: ARTISAN LIST & PAYOUTS */}
      {activeTab === 'list' && (
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8f9fa' }}>
                    <tr style={{ textAlign: 'left' }}>
                        <th style={styles.th}>Artisan Name</th>
                        <th style={styles.th}>Specialty</th>
                        <th style={styles.th}>Completed Jobs</th>
                        <th style={styles.th}>Total Sales</th>
                        <th style={styles.th}>Payout (20%)</th>
                        <th style={styles.th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {artisans.map(art => {
                        const stats = calculatePayout(art.email);
                        return (
                            <tr key={art.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={styles.td}>
                                    <strong>{art.name}</strong><br/>
                                    <span style={{ fontSize: '12px', color: '#666' }}>{art.email}</span>
                                </td>
                                <td style={styles.td}>{art.specialty}</td>
                                <td style={styles.td}>
                                    <span style={{ fontWeight: 'bold' }}>{stats.count}</span>
                                </td>
                                <td style={styles.td}>₹{stats.sales.toLocaleString()}</td>
                                <td style={styles.td}>
                                    <span style={{ color: 'green', fontWeight: 'bold', background: '#e8f5e9', padding: '5px 10px', borderRadius: '4px' }}>
                                        ₹{stats.payout.toLocaleString()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button style={{ fontSize: '12px', cursor: 'pointer', padding: '5px 10px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px' }}>
                                        View History
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {artisans.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No artisans found. Add one!</div>}
          </div>
      )}

    </div>
  );
}

const styles = {
    card: { background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    label: { display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#555' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' },
    saveBtn: { marginTop: '20px', padding: '12px 25px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    th: { padding: '15px', fontSize: '13px', color: '#555', borderBottom: '1px solid #eee' },
    td: { padding: '15px', fontSize: '14px', verticalAlign: 'middle' }
};