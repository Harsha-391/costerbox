/* src/app/shop/[id]/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import ChatWindow from '../../../components/ChatWindow';
import { ShoppingCart, CreditCard, MessageCircle, ArrowLeft, AlertTriangle, ChevronDown, X, Ruler, Truck, Droplets, HelpCircle, Layers } from 'lucide-react';
import '../../../styles/product.css';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(''); // Restore Main Image State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);

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

                    // Set Main Image
                    if (data.featuredImage) setMainImage(data.featuredImage);
                    else if (data.media && data.media.length > 0) setMainImage(data.media[0]);
                    else setMainImage('https://via.placeholder.com/800x1000?text=No+Image');

                    // Auto-select first size if available
                    if (data.sizes && data.sizes.length > 0) {
                        setSelectedSize(data.sizes[0]);
                    }
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

    // --- HANDLE BUY NOW ---
    const handleBuyNow = () => {
        if (!user) {
            alert("Please login to place an order.");
            return;
        }
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert("Please select a size.");
            return;
        }
        // Add to cart then redirect to checkout?
        addToCart(product, selectedSize);
        router.push('/cart'); // Or direct checkout
    };

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert("Please select a size.");
            return;
        }
        addToCart(product, selectedSize);
        // Optional: Show toast
        alert("Added to cart!");
    };

    const toggleAccordion = (key) => {
        setOpenAccordion(openAccordion === key ? null : key);
    };

    // Calculate discount percentage
    const getDiscount = () => {
        if (product.comparePrice && product.price && Number(product.comparePrice) > Number(product.price)) {
            const discount = Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100);
            return discount;
        }
        return 0;
    };

    if (loading) return <div className="pdp-loading">Loading...</div>;
    if (!product) return <div className="pdp-loading">Product not found.</div>;

    const discount = getDiscount();

    // Prepare media array (Featured + Gallery)
    const mediaList = product.media && product.media.length > 0
        ? product.media
        : (product.featuredImage ? [product.featuredImage] : []);

    if (mediaList.length === 0) mediaList.push('https://via.placeholder.com/800x1000?text=No+Image');

    // Build accordion sections
    const accordionSections = [];
    if (product.materials && product.materials !== '<p><br></p>') accordionSections.push({ key: 'materials', icon: <Layers size={18} />, title: 'Materials', content: product.materials });
    if (product.shippingInfo && product.shippingInfo !== '<p><br></p>') accordionSections.push({ key: 'shipping', icon: <Truck size={18} />, title: 'Shipping', content: product.shippingInfo });
    if (product.careInfo && product.careInfo !== '<p><br></p>') accordionSections.push({ key: 'care', icon: <Droplets size={18} />, title: 'Care Information', content: product.careInfo });
    if (product.faqs && product.faqs !== '<p><br></p>') accordionSections.push({ key: 'faqs', icon: <HelpCircle size={18} />, title: 'FAQs & Help', content: product.faqs });

    return (
        <div className="pdp-wrapper">

            {/* CHAT MODAL OVERLAY */}
            {isChatOpen && user && (
                <div className="pdp-modal-overlay">
                    <ChatWindow
                        chatId={`inquiry_${user.uid}_${product.id}`}
                        artisanId={product.artisanId}
                        productName={product.name || product.title}
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
            )}

            {/* SIZE GUIDE MODAL */}
            {showSizeGuide && (
                <div className="pdp-modal-overlay" onClick={() => setShowSizeGuide(false)}>
                    <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="size-guide-header">
                            <h2>Size Guide</h2>
                            <button className="size-guide-close" onClick={() => setShowSizeGuide(false)}><X size={24} /></button>
                        </div>
                        <div className="size-guide-body">
                            {product.sizeGuide && product.sizeGuide !== '<p><br></p>' ? (
                                <div dangerouslySetInnerHTML={{ __html: product.sizeGuide }} />
                            ) : (
                                <>
                                    <table className="size-guide-table">
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                <th>Chest (in)</th>
                                                <th>Shoulder (in)</th>
                                                <th>Length (in)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td>S</td><td>38</td><td>16</td><td>27</td></tr>
                                            <tr><td>M</td><td>40</td><td>17</td><td>28</td></tr>
                                            <tr><td>L</td><td>42</td><td>18</td><td>29</td></tr>
                                            <tr><td>XL</td><td>44</td><td>19</td><td>30</td></tr>
                                        </tbody>
                                    </table>
                                    <div className="size-guide-note">
                                        Note: Above measurements are body measurements. Garments may have 2-4 inches margin.
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* BREADCRUMB */}
            <div className="pdp-breadcrumb">
                <button onClick={() => router.back()} className="pdp-back">
                    <ArrowLeft size={16} /> Back
                </button>
                /
                <span>{product.category || 'Shop'}</span>
                /
                <span style={{ color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name || product.title}</span>
            </div>

            <div className="pdp-layout">

                {/* ====== LEFT: GALLERY (MAIN + THUMBS) ====== */}
                <div className="pdp-gallery-wrapper">
                    {/* Main Image View */}
                    <div className="pdp-main-image-container">
                        <img src={mainImage} alt={product.title} className="pdp-main-image" />
                        {discount > 0 && <span className="pdp-discount-badge">-{discount}% OFF</span>}
                        {product.badge && <span className="pdp-badge">{product.badge}</span>}
                    </div>

                    {/* Thumbnails Row (Desktop) / Hidden on Mobile if needed, or keeping styling simplistic */}
                    {mediaList.length > 1 && (
                        <div className="pdp-thumbs-row">
                            {mediaList.map((imgUrl, index) => (
                                <div
                                    key={index}
                                    className={`pdp-thumb-item ${mainImage === imgUrl ? 'active' : ''}`}
                                    onClick={() => setMainImage(imgUrl)}
                                >
                                    <img src={imgUrl} alt="thumbnail" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ====== RIGHT: INFO ====== */}
                <div className="pdp-info-column">
                    {product.vendor && <span className="pdp-vendor">{product.vendor}</span>}
                    <h1 className="pdp-title">{product.name || product.title}</h1>

                    {/* PRICING */}
                    <div className="pdp-pricing">
                        <span className="pdp-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                            <>
                                <span className="pdp-compare-price">₹{Number(product.comparePrice).toLocaleString('en-IN')}</span>
                                <span className="pdp-save-tag">SAVE {discount}%</span>
                            </>
                        )}
                    </div>

                    <p className="pdp-tax-note">Tax included. Shipping calculated at checkout.</p>

                    {/* SIZE SELECTOR */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="pdp-size-section">
                            <div className="pdp-size-header">
                                <span className="pdp-size-label">Select Size</span>
                                <button className="pdp-size-guide-btn" onClick={() => setShowSizeGuide(true)}>
                                    <Ruler size={14} /> Size Guide
                                </button>
                            </div>
                            <div className="pdp-size-options">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`pdp-size-btn ${selectedSize === size ? 'pdp-size-active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pdp-actions">
                        <button className="pdp-btn-cart" onClick={handleAddToCart}>
                            add to bag
                        </button>
                        <button className="pdp-btn-buy" onClick={handleBuyNow}>
                            Buy it now
                        </button>
                    </div>

                    {/* CUSTOMIZATION */}
                    {product.isCustomizable && (
                        <>
                            <div className="pdp-custom-notice">
                                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                <div>
                                    <strong>Customization Available</strong>
                                    <div>All customized orders require a <strong>70% prepayment</strong> before the artisan begins work.</div>
                                </div>
                            </div>
                            <button
                                className="pdp-btn-customize"
                                onClick={() => {
                                    if (!user) alert("Please login to chat with the artisan.");
                                    else setIsChatOpen(true);
                                }}
                            >
                                <MessageCircle size={16} /> Discuss Customization
                            </button>
                        </>
                    )}

                    {/* DESCRIPTION (With Overflow Protection) */}
                    <div className="pdp-description-container">
                        <h3>About this piece</h3>
                        <div className="pdp-description-text">
                            {product.description ? (
                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                            ) : (
                                <p>No description provided.</p>
                            )}
                        </div>
                    </div>

                    {/* HIGHLIGHTS */}
                    {product.highlights && product.highlights.length > 0 && (
                        <div className="pdp-highlights">
                            {product.highlights.map((item, i) => (
                                <div key={i} className="pdp-highlight-row">
                                    <span className="pdp-highlight-label">{item.label}</span>
                                    <span className="pdp-highlight-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ACCORDION */}
                    {accordionSections.length > 0 && (
                        <div className="pdp-accordion">
                            {accordionSections.map((section) => (
                                <div key={section.key} className={`pdp-accordion-item ${openAccordion === section.key ? 'pdp-accordion-open' : ''}`}>
                                    <button className="pdp-accordion-trigger" onClick={() => toggleAccordion(section.key)}>
                                        <div className="pdp-accordion-left">
                                            {section.icon}
                                            <span style={{ marginLeft: '10px' }}>{section.title}</span>
                                        </div>
                                        <ChevronDown size={18} className="pdp-accordion-chevron" />
                                    </button>
                                    <div className="pdp-accordion-body">
                                        <div className="pdp-accordion-content" dangerouslySetInnerHTML={{ __html: section.content }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TRUST */}
                    <div className="pdp-trust">
                        <div className="pdp-trust-item"><img src="https://cdn-icons-png.flaticon.com/512/825/825590.png" width="20" alt="Handcrafted" /> Handcrafted</div>
                        <div className="pdp-trust-item"><img src="https://cdn-icons-png.flaticon.com/512/2910/2910795.png" width="20" alt="Eco-Friendly" /> Eco-Friendly</div>
                    </div>
                </div>
            </div>
        </div>
    );
}