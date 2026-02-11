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
const priceValue = parseInt(priceString.replace(/[^0-9]/g, ''));
      
      const res = await fetch("/api/razorpay", {
        method: "POST",
        body: JSON.stringify({ amount: priceValue }),
      });
      const orderData = await res.json();

      if (!orderData.id) throw new Error("Server error creating order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "CosterBox Artisan",
        description: `Payment for ${product.name}`,
        order_id: orderData.id,
        handler: async function (response) {
            await addDoc(collection(db, "orders"), {
                userId: user.uid,
                userEmail: user.email,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.featuredImage || product.media?.[0] || ""
                },
                shipping: formData,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                status: "paid",
                createdAt: serverTimestamp()
            });

            alert("Payment Successful! Order Placed.");
            router.push("/shop"); 
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

  if (loading) return <div style={{padding:'100px', textAlign:'center'}}>Loading Checkout...</div>;
  if (!product) return <div style={{padding:'100px', textAlign:'center'}}>Product not found.</div>;

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
                        <h4>{product.name}</h4>
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

                <div className="total-row">
                    <span>Total</span>
                    <span>{product.price}</span>
                </div>

                {/* NOTE: We move the button here so it's always visible with the summary */}
                <button 
                    type="submit" 
                    form="checkout-form" /* Links to the form on the left */
                    disabled={processing}
                    className="btn-pay"
                >
                    {processing ? "Processing..." : `Pay ${product.price}`}
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