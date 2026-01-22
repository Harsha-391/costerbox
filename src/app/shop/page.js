/* src/app/shop/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../../styles/shop.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA (Once on load) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Categories
        const catSnap = await getDocs(collection(db, 'categories'));
        setCategories(catSnap.docs.map(d => d.data().name));

        // 2. Fetch Products
        const prodSnap = await getDocs(collection(db, 'products'));
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter || p.region === filter);

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading Archive...</div>;

  return (
    <>
      {/* MOBILE FILTERS (Sticky) */}
      <div className="mobile-filters">
        <span 
            className={`m-filter-chip ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
        >
            All
        </span>
        {categories.map((cat, i) => (
            <span 
                key={i} 
                className={`m-filter-chip ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
            >
                {cat}
            </span>
        ))}
      </div>

      <div className="shop-container">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="sidebar">
            <div className="filter-group">
                <h3 className="filter-title">Collections</h3>
                <ul className="filter-list">
                    <li className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All Archive</li>
                    {/* Add static popular filters if needed */}
                    <li onClick={() => setFilter('New Arrivals')}>New Arrivals</li>
                </ul>
            </div>

            <div className="filter-group">
                <h3 className="filter-title">Categories</h3>
                <ul className="filter-list">
                     {categories.map((cat, i) => (
                        <li 
                            key={i} 
                            className={filter === cat ? 'active' : ''}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main class="main-gallery">
            <div class="gallery-header">
                <h1>The Artisan Archive</h1>
                <p>Curated pieces from the heart of Rajasthan. Respecting the hands that create.</p>
            </div>

            <div class="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} class="product-card">
                        <div class="img-box">
                            {product.badge && <span class="badge">{product.badge}</span>}
                           {/* --- SMARTER IMAGE LOGIC --- */}
{(() => {
    // 1. Try featuredImage first
    let finalImage = product.featuredImage;
    
    // 2. If no featuredImage, try the first image from the media array
    if (!finalImage && product.media && product.media.length > 0) {
        finalImage = product.media[0];
    }
    
    // 3. If still nothing, use fallback
    if (!finalImage) {
        finalImage = 'https://via.placeholder.com/400x500?text=No+Image';
    }

    return (
        <img 
            src={finalImage} 
            alt={product.title || 'Product Image'} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    );
})()}
                        </div>
                        <div class="card-details">
                            <span class="p-region">{product.region}</span>
                            <h3 class="p-name">{product.name}</h3>
                            <span class="p-price">{product.price}</span>
                            <button class="add-btn">Add to Bag</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredProducts.length === 0 && (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#999'}}>
                    <p>No artifacts found in this collection.</p>
                    <button onClick={() => setFilter('All')} style={{textDecoration:'underline'}}>View All</button>
                </div>
            )}
        </main>

      </div>
    </>
  );
}