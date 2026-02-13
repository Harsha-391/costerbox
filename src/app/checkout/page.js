/* src/app/checkout/page.js */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Script from "next/script";
import { Lock, CreditCard, MapPin } from "lucide-react";
import "../../styles/checkout.css"; // <--- IMPORT THE NEW CSS

function CheckoutContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get("productId");
    const router = useRouter();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        phone: "", address: "", city: "", zip: "",
    });

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            const docRef = doc(db, "products", productId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setProduct({ id: snap.id, ...snap.data() });
                if (user?.email) setFormData(prev => ({ ...prev, email: user.email }));
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);

        if (!user) {
            alert("Please login to place an order.");
            setProcessing(false);
            return;
        }

        try {
            // Safer conversion: Convert to String first, then remove non-digits
            const priceString = String(product.price);
            const rawPrice = parseInt(priceString.replace(/[^0-9]/g, ''));

            // CUSTOMIZATION LOGIC: 70% Advance
            const isCustom = product.isCustomizable || false;
            const payableAmount = isCustom ? Math.ceil(rawPrice * 0.70) : rawPrice;
            const pendingAmount = isCustom ? (rawPrice - payableAmount) : 0;

            const res = await fetch("/api/razorpay", {
                method: "POST",
                body: JSON.stringify({ amount: payableAmount }),
            });
            const orderData = await res.json();

            if (!orderData.id) throw new Error("Server error creating order");

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount, // Amount in paisa
                currency: "INR",
                name: "CosterBox Artisan",
                description: isCustom
                    ? `70% Advance for Custom ${product.name || product.title}`
                    : `Payment for ${product.name || product.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    console.log("Payment Success. Creating Order...", response);

                    try {
                        const safePayload = {
                            userId: user?.uid || "guest",
                            userEmail: user?.email || "guest@example.com",
                            product: {
                                id: product?.id || "unknown_product",
                                name: product?.name || product?.title || "Unnamed Product",
                                price: rawPrice, // Store Full Price
                                image: product?.featuredImage || product?.media?.[0] || "/placeholder.jpg",
                                isCustomizable: isCustom
                            },
                            shipping: {
                                firstName: formData.firstName || "",
                                lastName: formData.lastName || "",
                                email: formData.email || "",
                                phone: formData.phone || "",
                                address: formData.address || "",
                                city: formData.city || "",
                                zip: formData.zip || "",
                            },
                            payment: {
                                razorpayPaymentId: response.razorpay_payment_id || "demo_id",
                                razorpayOrderId: response.razorpay_order_id || "demo_order_id",
                                paidAmount: payableAmount,
                                pendingAmount: pendingAmount,
                                totalAmount: rawPrice,
                                type: isCustom ? "PARTIAL_ADVANCE" : "FULL_PAYMENT"
                            },
                            // Custom orders need artisan acceptance
                            status: isCustom ? "pending_artisan_acceptance" : "paid",
                            isCustomOrder: isCustom,
                            createdAt: serverTimestamp()
                        };

                        await addDoc(collection(db, "orders"), safePayload);

                        alert(isCustom
                            ? "Custom Order Placed! Notification sent to nearby artisans."
                            : "Payment Successful! Order Placed.");

                        router.push("/orders");
                    } catch (err) {
                        console.error("Error saving order to Firestore:", err);
                        alert("Payment successful but failed to save order. Please contact support.");
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: { color: "#000000" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Payment failed. Please try again.");
        }
        setProcessing(false);
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Checkout...</div>;
    if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Product not found.</div>;

    return (
        <div className="checkout-container">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <h1 className="checkout-title">Secure Checkout</h1>

            <div className="checkout-grid">

                {/* LEFT: SHIPPING FORM */}
                <div className="shipping-section">
                    <h2><MapPin size={20} /> Shipping Details</h2>

                    <form id="checkout-form" onSubmit={handlePayment}>
                        <div className="form-row">
                            <input
                                name="firstName" placeholder="First Name" required
                                className="input-field" autoComplete="given-name"
                                onChange={handleChange}
                            />
                            <input
                                name="lastName" placeholder="Last Name" required
                                className="input-field" autoComplete="family-name"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                name="email" type="email" placeholder="Email Address" required
                                className="input-field" autoComplete="email"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                name="phone" type="tel" placeholder="Mobile Number" required
                                className="input-field" autoComplete="tel"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <input
                                name="address" placeholder="Street Address" required
                                className="input-field" autoComplete="street-address"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <input
                                name="city" placeholder="City" required
                                className="input-field" autoComplete="address-level2"
                                onChange={handleChange}
                            />
                            <input
                                name="zip" placeholder="ZIP Code" required
                                className="input-field" autoComplete="postal-code"
                                onChange={handleChange}
                            />
                        </div>
                    </form>
                </div>

                {/* RIGHT: ORDER SUMMARY */}
                <div className="order-summary">
                    <h3 className="summary-title">Order Summary</h3>

                    <div className="product-snippet">
                        <img
                            src={product.featuredImage || product.media?.[0]}
                            className="snippet-img"
                        />
                        <div className="snippet-info">
                            <h4>{product.name || product.title}</h4>
                            <p>{product.region}</p>
                        </div>
                    </div>

                    <div className="price-row">
                        <span>Subtotal</span>
                        <span>{product.price}</span>
                    </div>
                    <div className="price-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>

                    {/* PRICE BREAKDOWN */}
                    <div className="total-row" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <span>Total Price</span>
                        <span>{product.price}</span>
                    </div>

                    {product.isCustomizable && (
                        <>
                            <div className="price-row" style={{ color: '#166534', fontWeight: 'bold' }}>
                                <span>Advance (70%)</span>
                                <span>₹{Math.ceil(parseInt(String(product.price).replace(/[^0-9]/g, '')) * 0.70)}</span>
                            </div>
                            <div className="price-row" style={{ color: '#854d0e', fontSize: '13px' }}>
                                <span>Remaining Balance (30%)</span>
                                <span>₹{parseInt(String(product.price).replace(/[^0-9]/g, '')) - Math.ceil(parseInt(String(product.price).replace(/[^0-9]/g, '')) * 0.70)}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic' }}>
                                * Custom order. Remaining balance due before shipping.
                            </div>
                        </>
                    )}

                    {/* NOTE: We move the button here so it's always visible with the summary */}
                    <button
                        type="submit"
                        form="checkout-form" /* Links to the form on the left */
                        disabled={processing}
                        className="btn-pay"
                    >
                        {processing ? "Processing..." : (product.isCustomizable ? "Pay Advance" : `Pay ${product.price}`)}
                        {!processing && <CreditCard size={18} />}
                    </button>

                    <p className="secure-note">
                        <Lock size={12} /> SSL Secure Payment via Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}