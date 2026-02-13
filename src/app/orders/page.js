/* src/app/orders/page.js */
"use client";
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Package, Truck, CheckCircle, ExternalLink, MapPin } from 'lucide-react';
import '../../styles/orders.css';

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) { setLoading(false); return; }
            setError(null);
            console.log("Fetching orders for user:", user.uid);

            try {
                // Simple query first - no ordering to avoid index issues
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid)
                );

                const querySnapshot = await getDocs(q);
                console.log("Orders found:", querySnapshot.size);

                const results = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort client-side
                results.sort((a, b) => {
                    const getTime = (t) => {
                        if (!t) return 0;
                        if (typeof t.toMillis === 'function') return t.toMillis(); // Firestore Timestamp
                        if (t instanceof Date) return t.getTime(); // JS Date
                        if (typeof t === 'number') return t; // Timestamp as number
                        if (typeof t === 'string') return new Date(t).getTime(); // ISO String
                        return 0;
                    };
                    return getTime(b.createdAt) - getTime(a.createdAt);
                });

                setOrders(results);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Unable to load your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    // Helper for Date Display
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Date unknown';
        try {
            if (typeof timestamp.toDate === 'function') return timestamp.toDate().toLocaleDateString();
            if (timestamp instanceof Date) return timestamp.toLocaleDateString();
            if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString();
            if (typeof timestamp === 'string') return new Date(timestamp).toLocaleDateString();
            return 'Invalid Date';
        } catch (e) {
            return 'Date Error';
        }
    };

    // Helper for Progress Bar
    const getStatusStep = (status) => {
        if (status === 'delivered') return 3;
        if (status === 'shipped') return 2;
        return 1; // 'paid' or 'processing'
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading history...</div>;
    if (!user) return <div className="orders-container no-orders">Please login.</div>;
    if (error) return <div className="orders-container no-orders"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="orders-container">
            <h1 className="page-title">My Orders</h1>

            {orders.length === 0 ? (
                <div className="no-orders"><p>No orders yet.</p></div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => {
                        const step = getStatusStep(order.status);

                        return (
                            <div key={order.id} className="order-card">
                                {/* HEADER */}
                                <div className="order-header">
                                    <div className="order-id">
                                        Order #<span>{order.orderId ? order.orderId.slice(-6).toUpperCase() : '---'}</span>
                                    </div>
                                    <div className="order-date">
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>

                                {/* TRACKING BAR */}
                                <div style={{ padding: '24px 24px 8px' }}>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '36rem', marginBottom: '8px' }}>
                                        {/* Line Background */}
                                        <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: '4px', background: '#e5e7eb', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                                        {/* Colored Progress Line */}
                                        <div style={{ position: 'absolute', left: 0, top: '50%', height: '4px', background: '#16a34a', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.5s', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

                                        {/* Steps */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '4px', borderRadius: '50%', position: 'relative', zIndex: 1, color: step >= 1 ? '#16a34a' : '#9ca3af' }}>
                                            <Package size={24} fill={step >= 1 ? "currentColor" : "none"} />
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Processing</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '4px', borderRadius: '50%', position: 'relative', zIndex: 1, color: step >= 2 ? '#16a34a' : '#9ca3af' }}>
                                            <Truck size={24} fill={step >= 2 ? "currentColor" : "none"} />
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Shipped</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '4px', borderRadius: '50%', position: 'relative', zIndex: 1, color: step >= 3 ? '#16a34a' : '#9ca3af' }}>
                                            <CheckCircle size={24} fill={step >= 3 ? "currentColor" : "none"} />
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Delivered</span>
                                        </div>
                                    </div>

                                    {/* TRACKING DETAILS BOX */}
                                    {order.status === 'shipped' && order.tracking && (
                                        <div style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center' }}>
                                                    <Truck size={16} style={{ marginRight: '8px' }} />
                                                    {order.tracking.courier}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#2563eb', paddingLeft: '24px', margin: 0 }}>
                                                    AWB: {order.tracking.id}
                                                </p>
                                            </div>
                                            {order.tracking.link && (
                                                <a href={order.tracking.link} target="_blank" style={{ fontSize: '12px', background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Track <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PRODUCT INFO */}
                                <div className="order-body" style={{ borderTop: '1px solid #f3f4f6', marginTop: '16px' }}>
                                    <img
                                        src={order.product?.image || 'https://via.placeholder.com/100'}
                                        className="order-img"
                                    />
                                    <div className="product-info">
                                        <h3>{order.product?.name}</h3>
                                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Qty: 1</p>
                                    </div>
                                    <div className="order-total">
                                        <strong>{order.product?.price}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}