/* src/app/secured/superadmin/manage-products/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d => ({id: d.id, ...d.data()})));
        setLoading(false);
    };
    fetch();
  }, []);

  const deleteProduct = async (id) => {
      if(confirm("Are you sure? This cannot be undone.")) {
          await deleteDoc(doc(db, 'products', id));
          setProducts(products.filter(p => p.id !== id));
      }
  };

  if(loading) return <div>Loading Inventory...</div>;

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1>Inventory ({products.length})</h1>
            <input placeholder="Search products..." style={{ padding: '10px', width: '300px' }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                    <tr>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Category</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Price</th>
                        <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img src={p.mainImage || p.image} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                {p.name}
                            </td>
                            <td style={{ padding: '15px' }}>{p.category}</td>
                            <td style={{ padding: '15px' }}>{p.price}</td>
                            <td style={{ padding: '15px' }}>
                                <span style={{ background: '#e8f5e9', color: 'green', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                <button style={{ marginRight: '10px', color: 'blue' }}>Edit</button>
                                <button onClick={() => deleteProduct(p.id)} style={{ color: 'red' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}