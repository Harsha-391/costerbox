/* src/app/shop/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext'; 
import ChatWindow from '../../components/'; 
import Link from 'next/link'; // <--- 1. IMPORT ADDED
import { MessageCircle, ShoppingBag, X } from 'lucide-react'; 
import '../../styles/shop.css';

export default function ShopPage() {
  const { user } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Track which product is currently being discussed
  const [activeChatProduct, setActiveChatProduct] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        setCategories(catSnap.docs.map(d => d.data().name));

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

  // --- HANDLER: OPEN CHAT ---
  const handleOpenChat = (product) => {
    if (!user) {
        alert("Please login to customize this product.");
        return;
    }
    setActiveChatProduct(product);
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading Archive...</div>;

  return (
    <>
      {/* --- CHAT MODAL OVERLAY --- */}
      {activeChatProduct && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <ChatWindow 
                chatId={`inquiry_${user.uid}_${activeChatProduct.id}`} 
                artisanId={activeChatProduct.artisanId} 
                productName={activeChatProduct.name}
                onClose={() => setActiveChatProduct(null)}
            />
        </div>
      )}

      {/* MOBILE FILTERS */}
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
        
        {/* SIDEBAR */}
        <aside className="sidebar">
            <div className="filter-group">
                <h3 className="filter-title">Collections</h3>
                <ul className="filter-list">
                    <li className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All Archive</li>
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
        <main className="main-gallery">
            <div className="gallery-header">
                <h1>The Artisan Archive</h1>
                <p>Curated pieces from the heart of Rajasthan. Respecting the hands that create.</p>
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card relative group">
                        
                        {/* 2. WRAP IMAGE IN LINK */}
                        <Link href={`/shop/${product.id}`} className="block cursor-pointer">
                            <div className="img-box">
                                {product.badge && <span className="badge">{product.badge}</span>}
                                
                                {/* IMAGE LOGIC */}
                                {(() => {
                                    let finalImage = product.featuredImage;
                                    if (!finalImage && product.media && product.media.length > 0) {
                                        finalImage = product.media[0];
                                    }
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
                        </Link>

                        <div className="card-details">
                            <span className="p-region">{product.region}</span>
                            
                            {/* 3. WRAP TITLE IN LINK */}
                            <Link href={`/shop/${product.id}`} className="hover:underline">
                                <h3 className="p-name">{product.name}</h3>
                            </Link>

                            <span className="p-price">{product.price}</span>
                            
                            <div className="flex gap-2 mt-2">
                                {/* STANDARD ADD TO CART */}
                                <button className="add-btn flex-1 flex items-center justify-center gap-2">
                                    <ShoppingBag size={16} /> Add
                                </button>

                                {/* CUSTOMIZATION BUTTON (Conditional) */}
                                {product.isCustomizable && (
                                    <button 
                                        onClick={() => handleOpenChat(product)}
                                        className="bg-black text-white px-3 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
                                        title="Chat with Artisan to Customize"
                                    >
                                        <MessageCircle size={16} />
                                        <span className="hidden md:inline">Customize</span>
                                    </button>
                                )}
                            </div>
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