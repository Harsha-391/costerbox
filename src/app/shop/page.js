/* src/app/shop/page.js */
"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from '../../components/ChatWindow';
import Link from 'next/link';
import { MessageCircle, ShoppingBag, X } from 'lucide-react';
import '../../styles/shop.css';

function ShopPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const catFromUrl = searchParams.get('cat');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState(catFromUrl || 'All');
    const [loading, setLoading] = useState(true);

    // Track which product is currently being discussed
    const [activeChatProduct, setActiveChatProduct] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const catSnap = await getDocs(collection(db, 'categories'));
                setCategories(catSnap.docs.map(d => d.data().name).filter(Boolean));

                const prodSnap = await getDocs(collection(db, 'products'));
                setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                setLoading(false);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchData();
    }, []);

    // Update filter when URL param changes
    useEffect(() => {
        if (catFromUrl) setFilter(catFromUrl);
    }, [catFromUrl]);

    // --- FILTER LOGIC ---
    // Support filtering by category name, region, or tags (like "bestseller", "new-arrival")
    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => {
            // Match by category
            if (p.category === filter) return true;
            // Match by region
            if (p.region === filter) return true;
            // Match by tag (tags stored as array in Firestore)
            if (Array.isArray(p.tags) && p.tags.includes(filter.toLowerCase())) return true;
            return false;
        });

    // --- HANDLER: OPEN CHAT ---
    const handleOpenChat = (product) => {
        if (!user) {
            alert("Please login to customize this product.");
            return;
        }
        setActiveChatProduct(product);
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Archive...</div>;

    return (
        <>
            {/* --- CHAT MODAL OVERLAY --- */}
            {activeChatProduct && user && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '16px' }}>
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
                            <div key={product.id} className="product-card">

                                {/* 2. WRAP IMAGE IN LINK */}
                                <Link href={`/shop/${product.id}`} style={{ display: 'block', cursor: 'pointer' }}>
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
                                    <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none' }}>
                                        <h3 className="p-name">{product.name || product.title}</h3>
                                    </Link>

                                    <span className="p-price">{product.price}</span>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {/* STANDARD ADD TO CART */}
                                        <button className="add-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <ShoppingBag size={16} /> Add
                                        </button>

                                        {/* CUSTOMIZATION BUTTON (Conditional) */}
                                        {product.isCustomizable && (
                                            <button
                                                onClick={() => handleOpenChat(product)}
                                                style={{ background: '#1a1a1a', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}
                                                title="Chat with Artisan to Customize"
                                            >
                                                <MessageCircle size={16} />
                                                Customize
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                            <p>No artifacts found in this collection.</p>
                            <button onClick={() => setFilter('All')} style={{ textDecoration: 'underline' }}>View All</button>
                        </div>
                    )}
                </main>

            </div>
        </>
    );
}

// Suspense wrapper for useSearchParams
export default function ShopPage() {
    return (
        <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading Archive...</div>}>
            <ShopPageContent />
        </Suspense>
    );
}