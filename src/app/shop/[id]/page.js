/* src/app/shop/[id]/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import ChatWindow from '../../../components/ChatWindow';
import { ShoppingCart, CreditCard, MessageCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import '../../../styles/product.css';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // --- FETCH SINGLE PRODUCT DATA ---
    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, 'products', params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProduct(data);

                    if (data.featuredImage) setMainImage(data.featuredImage);
                    else if (data.media && data.media.length > 0) setMainImage(data.media[0]);
                    else setMainImage('https://via.placeholder.com/600x600?text=No+Image');
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id]);

    // --- NEW FUNCTION: HANDLE BUY NOW ---
    const handleBuyNow = () => {
        if (!user) {
            alert("Please login to place an order.");
            // Optional: router.push('/secured/login');
            return;
        }
        // Redirect to checkout page with the Product ID attached
        router.push(`/checkout?productId=${product.id}`);
    };

    if (loading) return <div className="loading-screen">Loading Artifact...</div>;
    if (!product) return <div className="loading-screen">Artifact not found.</div>;

    // --- RENDER PAGE ---
    return (
        <div className="product-page-wrapper">

            {/* CHAT MODAL OVERLAY */}
            {isChatOpen && user && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px' }}>
                    <ChatWindow
                        chatId={`inquiry_${user.uid}_${product.id}`}
                        artisanId={product.artisanId}
                        productName={product.name}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            )}

            <button onClick={() => router.back()} className="back-button">
                <ArrowLeft size={20} /> Back to Archive
            </button>

            <div className="product-layout">
                {/* LEFT SIDE: Image Gallery */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        <img src={mainImage} alt={product.name} className="main-image" />
                        {product.badge && <span className="product-badge">{product.badge}</span>}
                    </div>

                    {product.media && product.media.length > 1 && (
                        <div className="thumbnail-row">
                            {product.media.map((imgUrl, index) => (
                                <img
                                    key={index}
                                    src={imgUrl}
                                    alt={`Thumbnail ${index}`}
                                    className={`thumbnail ${mainImage === imgUrl ? 'active-thumb' : ''}`}
                                    onClick={() => setMainImage(imgUrl)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Product Details */}
                <div className="product-info">
                    <span className="product-region">{product.region || 'Rajasthan, India'}</span>
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-price">₹{product.price}</p>

                    <div className="product-description">
                        <h3>About this piece</h3>
                        <p>{product.description || 'No description provided for this artifact.'}</p>
                    </div>

                    {/* CUSTOMIZATION DISCLAIMER */}
                    {product.isCustomizable && (
                        <div className="customization-disclaimer">
                            <AlertTriangle size={20} className="warning-icon" />
                            <div>
                                <strong>Customization Available</strong>
                                <p>Please note: All customized orders require a <strong>70% prepayment</strong> before the artisan begins work.</p>
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="action-buttons">
                        <button className="btn-add-cart" onClick={() => alert("Added to cart (Demo)")}>
                            <ShoppingCart size={20} /> Add to Bag
                        </button>

                        {/* --- UPDATED BUY BUTTON --- */}
                        <button className="btn-buy-now" onClick={handleBuyNow}>
                            <CreditCard size={20} /> Buy Now
                        </button>
                    </div>

                    {/* CUSTOMIZE BUTTON */}
                    {product.isCustomizable && (
                        <button
                            className="btn-customize"
                            onClick={() => {
                                if (!user) alert("Please login to chat with the artisan.");
                                else setIsChatOpen(true);
                            }}
                        >
                            <MessageCircle size={20} /> Discuss Customization with Artisan
                        </button>
                    )}

                    <div className="shipping-info">
                        <p>✓ Authentic Handcrafted Item</p>
                        <p>✓ Ships safely packed directly from the region</p>
                    </div>
                </div>
            </div>
        </div>
    );
}