/* src/app/shop/[id]/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import ChatWindow from '../../../components/ChatWindow';
import { ShoppingCart, CreditCard, MessageCircle, ArrowLeft, AlertTriangle, ChevronDown, X, Ruler, Truck, Droplets, HelpCircle, Layers, Heart } from 'lucide-react';
import '../../../styles/product.css';
import '../../../styles/size_guide.css';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(''); // Restore Main Image State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false); // --- CUSTOM MODAL STATE ---

    // --- FETCH SINGLE PRODUCT DATA ---
    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                // 1. Try Fetching by Doc ID (Default behavior)
                // Decode params.id to handle URL encoding
                const paramId = decodeURIComponent(params.id);

                const docRef = doc(db, 'products', paramId);
                const docSnap = await getDoc(docRef);

                let data = null;

                if (docSnap.exists()) {
                    data = { id: docSnap.id, ...docSnap.data() };
                } else {
                    // 2. If ID not found, Try Querying by Slug (seoHandle)
                    const q = query(collection(db, "products"), where("seoHandle", "==", paramId));
                    const querySnap = await getDocs(q);

                    if (!querySnap.empty) {
                        const d = querySnap.docs[0];
                        data = { id: d.id, ...d.data() };
                    }
                }

                if (data) {
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

    // --- HOOP CUSTOMIZATION STATE ---
    const [hoopSize, setHoopSize] = useState('10 inch');
    const [tasselCount, setTasselCount] = useState(0);

    // --- EFFECT: Reset on Product Change ---
    useEffect(() => {
        setHoopSize('10 inch');
        setTasselCount(0);
    }, [product?.id]);

    // --- PRICE CALCULATION for Hoops ---
    const getHoopPrice = () => {
        if (!product) return 0;
        let base = Number(product.price);

        // Size Add-ons
        if (hoopSize === '12 inch') base += 200;
        if (hoopSize === '14 inch') base += 700;

        // Tassels
        if (tasselCount > 0) base += (tasselCount * 70);

        return base;
    };

    const isHoopCategory = product?.category?.toLowerCase() === 'hoops';
    const finalPrice = isHoopCategory ? getHoopPrice() : Number(product?.price || 0);

    // --- CUSTOMIZED ADD TO CART ---
    const handleAddToCart = () => {
        if (!user) {
            alert("Please login to place an order.");
            return;
        }

        if (isHoopCategory) {
            // Create custom description as "size"
            let customDesc = `${hoopSize}`;
            if (tasselCount > 0) customDesc += ` + ${tasselCount} Tassels`;

            // Create temp product with updated price
            const customProduct = {
                ...product,
                price: finalPrice
            };

            addToCart(customProduct, customDesc);
            alert(`Added to cart: ${customDesc} for ₹${finalPrice}`);
            return;
        }

        // Standard Product Logic
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert("Please select a size.");
            return;
        }
        addToCart(product, selectedSize);
        alert("Added to cart!");
    };

    const handleBuyNow = () => {
        if (!user) {
            alert("Please login to place an order.");
            return;
        }

        if (isHoopCategory) {
            let customDesc = `${hoopSize}`;
            if (tasselCount > 0) customDesc += ` + ${tasselCount} Tassels`;

            const customProduct = {
                ...product,
                price: finalPrice
            };
            addToCart(customProduct, customDesc);
            router.push('/cart');
            return;
        }

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            alert("Please select a size.");
            return;
        }
        addToCart(product, selectedSize);
        router.push('/cart');
    };

    // --- HANDLE CUSTOM PAYMENT (MODAL) ---
    const handleCustomPayment = (type) => {
        let payNowPrice = finalPrice;
        let customDesc = "Custom Order";
        let baseSize = "";

        if (isHoopCategory) {
            customDesc = `${hoopSize}`;
            if (tasselCount > 0) customDesc += ` + ${tasselCount} Tassels`;
        } else if (selectedSize) {
            customDesc = `${selectedSize}`;
            baseSize = selectedSize;
        } else if (product.sizes && product.sizes.length > 0) {
            alert("Please select a base size first.");
            return;
        }

        let dueAmount = 0;
        if (type === 'partial') {
            payNowPrice = Math.ceil(finalPrice * 0.7);
            dueAmount = finalPrice - payNowPrice;
            customDesc += ` (70% Advance)`;
        } else {
            customDesc += ` (Full Custom Payment)`;
        }

        const customProduct = {
            ...product,
            price: payNowPrice,
            custom_metadata: {
                is_custom: true,
                payment_type: type, // 'partial' or 'full'
                total_amount: finalPrice,
                due_amount: dueAmount,
                base_desc: customDesc
            }
        };

        addToCart(customProduct, customDesc);
        setIsCustomModalOpen(false);
        router.push('/cart');
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
                            {product.sizeGuideImage ? (
                                <img
                                    src={product.sizeGuideImage}
                                    alt="Size Chart"
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            ) : (product.sizeGuide && typeof product.sizeGuide === 'string' && (product.sizeGuide.startsWith('http') || product.sizeGuide.includes('firebasestorage'))) ? (
                                <img
                                    src={product.sizeGuide}
                                    alt="Size Chart"
                                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                />
                            ) : product.sizeGuide && product.sizeGuide !== '<p><br></p>' ? (
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
                        <span className="pdp-price">₹{Number(finalPrice).toLocaleString('en-IN')}</span>
                        {product.comparePrice && Number(product.comparePrice) > Number(finalPrice) && (
                            <>
                                <span className="pdp-compare-price">₹{Number(product.comparePrice).toLocaleString('en-IN')}</span>
                                <span className="pdp-save-tag">SAVE {discount}%</span>
                            </>
                        )}
                    </div>

                    <p className="pdp-tax-note">Tax included. Shipping calculated at checkout.</p>

                    {/* --- HOOP CUSTOMIZATION UI --- */}
                    {isHoopCategory ? (
                        <div className="pdp-customization-box" style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customize Your Hoops</h4>

                            {/* Size Selection */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Select Size:</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {['10 inch', '12 inch', '14 inch'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setHoopSize(size)}
                                            style={{
                                                padding: '8px 12px',
                                                border: hoopSize === size ? '2px solid #1a1a1a' : '1px solid #ddd',
                                                background: hoopSize === size ? '#fff' : '#fff',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: hoopSize === size ? 'bold' : 'normal',
                                                color: '#1a1a1a'
                                            }}
                                        >
                                            {size} {size === '10 inch' ? '' : size === '12 inch' ? '(+₹200)' : '(+₹700)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tassels Selection */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Add Tassels (+₹70 each):</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => setTasselCount(Math.max(0, tasselCount - 1))}
                                        style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                                    >-</button>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{tasselCount}</span>
                                    <button
                                        onClick={() => setTasselCount(tasselCount + 1)}
                                        style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* SIZE SELECTOR OR SIZE GUIDE BUTTON (Original Logic) */
                        (product.sizes && product.sizes.length > 0) ? (
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
                        ) : (
                            /* Show Size Guide Button if no sizes but content exists */
                            (product.sizeGuideImage || (product.sizeGuide && product.sizeGuide.length > 15 && product.sizeGuide !== '<p><br></p>')) && (
                                <div className="pdp-size-section" style={{ borderTop: 'none', padding: '10px 0 20px 0' }}>
                                    <button className="pdp-size-guide-btn" onClick={() => setShowSizeGuide(true)} style={{ textDecoration: 'none', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '4px' }}>
                                        <Ruler size={16} /> View Size Guide
                                    </button>
                                </div>
                            )
                        )
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pdp-actions">
                        <button className="pdp-btn-cart" onClick={handleAddToCart}>
                            Add to Bag
                        </button>
                        <button className="pdp-btn-buy" onClick={handleBuyNow}>
                            Buy Now
                        </button>
                        <button
                            className="pdp-btn-wishlist"
                            onClick={() => toggleWishlist(product)}
                            style={{
                                border: '1px solid #ddd',
                                background: isInWishlist(product.id) ? '#ffebee' : 'transparent',
                                width: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                borderRadius: '4px'
                            }}
                            title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart
                                size={20}
                                fill={isInWishlist(product.id) ? "#e53935" : "none"}
                                color={isInWishlist(product.id) ? "#e53935" : "#1a1a1a"}
                            />
                        </button>
                    </div>


                    {/* CUSTOMIZATION BUTTON */}
                    <button
                        className="pdp-btn-customize-main"
                        onClick={() => {
                            if (!user) {
                                alert("Please login to customize.");
                                return;
                            }
                            setIsCustomModalOpen(true);
                        }}
                        style={{
                            width: '100%',
                            marginTop: '15px',
                            padding: '12px',
                            background: '#fff',
                            color: '#1a1a1a',
                            border: '1px solid #1a1a1a',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <MessageCircle size={16} /> Customize This Product
                    </button>

                    {/* CUSTOMIZATION MODAL */}
                    {isCustomModalOpen && (
                        <div className="pdp-modal-overlay" onClick={() => setIsCustomModalOpen(false)}>
                            <div className="pdp-modal-content" onClick={(e) => e.stopPropagation()} style={{
                                background: '#fff',
                                padding: '30px',
                                borderRadius: '8px',
                                maxWidth: '500px',
                                width: '90%',
                                position: 'relative'
                            }}>
                                <button
                                    onClick={() => setIsCustomModalOpen(false)}
                                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    <X size={24} />
                                </button>

                                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertTriangle color="#f59e0b" /> Customization
                                </h2>

                                <p style={{ marginBottom: '20px', lineHeight: '1.6', color: '#555' }}>
                                    Customizing this product requires a <strong>70% upfront payment</strong> before our artisans begin their work.
                                    The remaining 30% will be due before dispatch.
                                </p>

                                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span>Total Price:</span>
                                        <strong>₹{finalPrice.toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a1a1a' }}>
                                        <span>70% Advance:</span>
                                        <strong>₹{Math.ceil(finalPrice * 0.7).toLocaleString('en-IN')}</strong>
                                    </div>
                                </div>

                                <h4 style={{ marginBottom: '10px' }}>Choose Payment Option:</h4>

                                <button
                                    onClick={() => handleCustomPayment('partial')}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: '#1a1a1a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>Pay 70% Advance</span>
                                    <span>₹{Math.ceil(finalPrice * 0.7).toLocaleString('en-IN')}</span>
                                </button>

                                <button
                                    onClick={() => handleCustomPayment('full')}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        background: 'transparent',
                                        color: '#1a1a1a',
                                        border: '1px solid #1a1a1a',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>Pay Full Amount</span>
                                    <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                                </button>
                            </div>
                        </div>
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