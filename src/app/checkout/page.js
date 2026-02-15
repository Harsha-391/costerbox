/* src/app/checkout/page.js */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; // Import CartContext
import Script from "next/script";
import { Lock, CreditCard, MapPin } from "lucide-react";
import "../../styles/checkout.css";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { cartItems, clearCart } = useCart(); // Access cart

    // QUERY PARAMS for DIRECT BUY
    const productId = searchParams.get("productId");
    const directSize = searchParams.get("size");

    const [itemsToCheckout, setItemsToCheckout] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "",
        phone: "", address: "", city: "", zip: "",
    });

    // --- INITIALIZE CHECKOUT ITEMS ---
    useEffect(() => {
        const initCheckout = async () => {
            if (productId) {
                // === MODE A: DIRECT BUY (Single Item) ===
                try {
                    const docRef = doc(db, "products", productId);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        const singleItem = {
                            id: snap.id,
                            ...data,
                            selectedSize: directSize || (data.sizes?.[0]) || "Standard",
                            quantity: 1,
                            price: Number(data.price) // Ensure number
                        };
                        setItemsToCheckout([singleItem]);
                    } else {
                        alert("Product not found");
                        router.push("/products");
                    }
                } catch (err) {
                    console.error("Error fetching direct buy product:", err);
                }
            } else {
                // === MODE B: CART CHECKOUT ===
                if (cartItems.length === 0) {
                    // If cart is empty and no direct buy, redirect
                    // Check if we just mounted; maybe wait a tick? 
                    // Actually CartContext loads from localstorage pretty fast.
                    // We can show "Your cart is empty" instead of redirecting immediately if preferred,
                    // but redirecting to cart page seems appropriate.
                    // setCheck check inside render or effect?
                }
                setItemsToCheckout(cartItems);
            }

            // Prefill User Data
            if (user?.email) {
                setFormData(prev => ({ ...prev, email: user.email }));
            }
            setLoading(false);
        };

        initCheckout();
    }, [productId, directSize, user, cartItems.length]); // depend on cartItems.length to update if cart loads

    // If Cart Mode and Empty, Redirect (Safe check)
    useEffect(() => {
        if (!loading && !productId && itemsToCheckout.length === 0) {
            router.replace("/cart");
        }
    }, [loading, productId, itemsToCheckout, router]);


    // --- CALCULATIONS ---
    const calculateTotals = () => {
        let totalRaw = 0;
        let totalPayable = 0;
        let totalPending = 0;

        itemsToCheckout.forEach(item => {
            // Clean price logic
            const rawPrice = Number(item.price);
            const itemTotal = rawPrice * item.quantity;

            // Custom logic: 70% Advance
            const isCustom = item.isCustomizable || false;

            // Payable for this item
            const itemPayable = isCustom ? Math.ceil(itemTotal * 0.70) : itemTotal;
            const itemPending = itemTotal - itemPayable;

            totalRaw += itemTotal;
            totalPayable += itemPayable;
            totalPending += itemPending;
        });

        return { totalRaw, totalPayable, totalPending };
    };

    const { totalRaw, totalPayable, totalPending } = calculateTotals();


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
            // 1. Create Razorpay Order
            const res = await fetch("/api/razorpay", {
                method: "POST",
                body: JSON.stringify({ amount: totalPayable }),
            });
            const orderData = await res.json();

            if (!orderData.id) throw new Error("Server error creating order");

            // 2. Open Payment
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount, // paisa
                currency: "INR",
                name: "CosterBox Artisan",
                description: `Payment for ${itemsToCheckout.length} Item(s)`,
                order_id: orderData.id,
                handler: async function (response) {
                    console.log("Payment Success. Creating Order...", response);

                    try {
                        const safePayload = {
                            userId: user?.uid || "guest",
                            userEmail: user?.email || "guest@example.com",

                            // UPDATED: Store Items Array
                            items: itemsToCheckout.map(item => ({
                                id: item.id,
                                name: item.name || item.title || "Unnamed",
                                price: Number(item.price),
                                quantity: item.quantity,
                                selectedSize: item.selectedSize || "",
                                image: item.featuredImage || item.media?.[0] || "/placeholder.jpg",
                                isCustomizable: !!item.isCustomizable,
                                // Calculate specific amounts per item for record
                                amountPaid: item.isCustomizable ? Math.ceil(Number(item.price) * item.quantity * 0.70) : (Number(item.price) * item.quantity)
                            })),

                            shipping: { ...formData },

                            payment: {
                                razorpayPaymentId: response.razorpay_payment_id || "demo_id",
                                razorpayOrderId: response.razorpay_order_id || "demo_order_id",
                                paidAmount: totalPayable,
                                pendingAmount: totalPending,
                                totalAmount: totalRaw,
                                type: totalPending > 0 ? "PARTIAL_ADVANCE" : "FULL_PAYMENT"
                            },

                            orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            status: totalPending > 0 ? "pending_artisan_acceptance" : "paid",
                            isCustomOrder: totalPending > 0, // Flag if *any* custom exists
                            createdAt: serverTimestamp()
                        };

                        const docRef = await addDoc(collection(db, "orders"), safePayload);

                        // 3. Clear Cart ONLY if checking out from Cart
                        if (!productId) {
                            clearCart();
                        }

                        // 4. Auto-Ship (Only if fully paid? Or for all?)
                        // Usually custom orders (pending > 0) don't ship immediately.
                        // Standard orders (pending == 0) can ship.
                        if (totalPending === 0) {
                            fetch('/api/shiprocket/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: docRef.id })
                            }).catch(console.error);
                        }

                        alert("Order Placed Successfully!");
                        router.push("/orders");

                    } catch (err) {
                        console.error("Error saving order:", err);
                        alert("Payment successful but order save failed. Contact support.");
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
            alert("Payment init failed. Try again.");
        }
        setProcessing(false);
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Checkout...</div>;

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
                            <input name="firstName" placeholder="First Name" required className="input-field" onChange={handleChange} />
                            <input name="lastName" placeholder="Last Name" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input name="email" type="email" placeholder="Email Address" required className="input-field" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input name="phone" type="tel" placeholder="Mobile Number" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input name="address" placeholder="Street Address" required className="input-field" onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input name="city" placeholder="City" required className="input-field" onChange={handleChange} />
                            <input name="zip" placeholder="ZIP Code" required className="input-field" onChange={handleChange} />
                        </div>
                    </form>
                </div>

                {/* RIGHT: ORDER SUMMARY */}
                <div className="order-summary">
                    <h3 className="summary-title">Order Summary</h3>

                    <div className="checkout-items-list">
                        {itemsToCheckout.map((item, idx) => (
                            <div key={idx} className="product-snippet">
                                <img
                                    src={item.featuredImage || item.media?.[0] || "/placeholder.jpg"}
                                    className="snippet-img"
                                    alt="product"
                                />
                                <div className="snippet-info">
                                    <h4>{item.name || item.title}</h4>
                                    <p>Size: {item.selectedSize} | Qty: {item.quantity}</p>
                                    <p style={{ fontWeight: 600 }}>₹{Number(item.price).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="price-row">
                        <span>Subtotal</span>
                        <span>₹{totalRaw.toLocaleString('en-IN')}</span>
                    </div>

                    {totalPending > 0 && (
                        <div className="price-row" style={{ color: '#166534', fontWeight: 'bold' }}>
                            <span>Payable Now (Advance)</span>
                            <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    {totalPending > 0 && (
                        <div className="price-row" style={{ color: '#854d0e' }}>
                            <span>Pending Balance</span>
                            <span>₹{totalPending.toLocaleString('en-IN')}</span>
                        </div>
                    )}

                    <div className="total-row">
                        <span>Total Payable</span>
                        <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={processing}
                        className="btn-pay"
                    >
                        {processing ? "Processing..." : `Pay ₹${totalPayable.toLocaleString('en-IN')}`}
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