/* src/app/secured/superadmin/inventory/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../../lib/firebase'; // Ensure this path is correct!
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

import { Search } from 'lucide-react'; // Import Icon

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [sortOption, setSortOption] = useState("newest"); // Sort State
  const router = useRouter();

  // ... (useEffect remains same) ...
  useEffect(() => {
    // Listen to the 'products' collection in real-time
    const unsubscribe = onSnapshot(collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching inventory:", error);
        setErrorMsg(error.message); // Show error on screen
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Safe Date Accessor
  const getTime = (p) => {
    // Handle Firebase Timestamp, JS Date, or String
    if (!p.createdAt) return 0;
    if (typeof p.createdAt.toMillis === 'function') return p.createdAt.toMillis();
    if (p.createdAt instanceof Date) return p.createdAt.getTime();
    return new Date(p.createdAt).getTime() || 0;
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p =>
    (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortOption === 'newest') return getTime(b) - getTime(a);
    if (sortOption === 'oldest') return getTime(a) - getTime(b);
    if (sortOption === 'name-asc') return (a.title || '').localeCompare(b.title || '');
    if (sortOption === 'name-desc') return (b.title || '').localeCompare(a.title || '');
    return 0;
  });

  // ... (handleEdit, handleDelete remain same) ...
  const handleEdit = (id) => {
    router.push(`/secured/superadmin/add-product?edit=${id}`);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading Inventory...</div>;

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Inventory ({filteredProducts.length})</h1>

        <div style={{ display: 'flex', gap: '15px' }}>
          {/* SEARCH BAR */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' }}
            />
          </div>

          {/* SORT DROPDOWN */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>

          <button
            onClick={() => router.push('/secured/superadmin/add-product')}
            style={{ background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* ERROR MONITOR */}
      {errorMsg && (
        <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ef9a9a' }}>
          <strong>Connection Error:</strong> {errorMsg}
        </div>
      )}

      {products.length === 0 && !errorMsg ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No Products Found</h3>
          <p>Your database seems empty, or we are looking in the wrong collection.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: `hidden` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f4f4f4' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Product Details</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={styles.td}>
                    <img
                      src={p.featuredImage || 'https://via.placeholder.com/50'}
                      alt="img"
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={styles.td}>
                    <strong>{p.title}</strong><br />
                    <span style={{ fontSize: '12px', color: '#666' }}>SKU: {p.sku || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>₹{p.price}</td>
                  <td style={styles.td}>
                    <span style={{ color: (p.stock || 0) < 5 ? 'red' : 'green', fontWeight: 'bold' }}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(p.id)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No products match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: { padding: '15px', fontSize: '13px', color: '#555' },
  td: { padding: '15px', fontSize: '14px' },
  editBtn: { marginRight: '10px', padding: '6px 12px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', background: 'none', border: '1px solid #d32f2f', color: '#d32f2f', borderRadius: '4px', cursor: 'pointer' }
};