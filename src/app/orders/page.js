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

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) { setLoading(false); return; }
            try {
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) { console.error("Error fetching orders:", error); }
            setLoading(false);
        };
        fetchOrders();
    }, [user]);

    // Helper for Progress Bar
    const getStatusStep = (status) => {
        if (status === 'delivered') return 3;
        if (status === 'shipped') return 2;
        return 1; // 'paid' or 'processing'
    };

    if (loading) return <div style={{textAlign:'center', padding:'100px'}}>Loading history...</div>;
    if (!user) return <div className="orders-container no-orders">Please login.</div>;

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
                                        {order.createdAt?.toDate().toLocaleDateString()}
                                    </div>
                                </div>

                                {/* TRACKING BAR */}
                                <div className="px-6 pt-6 pb-2">
                                    <div className="relative flex items-center justify-between w-full max-w-xl mb-2">
                                        {/* Line Background */}
                                        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                                        {/* Colored Progress Line */}
                                        <div 
                                            className="absolute left-0 top-1/2 h-1 bg-green-600 -z-10 transition-all duration-500"
                                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                                        ></div>

                                        {/* Steps */}
                                        <div className={`flex flex-col items-center bg-white p-1 rounded-full ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                                            <Package size={24} fill={step >= 1 ? "currentColor" : "none"} />
                                            <span className="text-xs font-bold mt-1">Processing</span>
                                        </div>
                                        <div className={`flex flex-col items-center bg-white p-1 rounded-full ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                                            <Truck size={24} fill={step >= 2 ? "currentColor" : "none"} />
                                            <span className="text-xs font-bold mt-1">Shipped</span>
                                        </div>
                                        <div className={`flex flex-col items-center bg-white p-1 rounded-full ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                                            <CheckCircle size={24} fill={step >= 3 ? "currentColor" : "none"} />
                                            <span className="text-xs font-bold mt-1">Delivered</span>
                                        </div>
                                    </div>

                                    {/* TRACKING DETAILS BOX */}
                                    {order.status === 'shipped' && order.tracking && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-800 font-bold">
                                                    <Truck size={16} className="inline mr-2"/>
                                                    {order.tracking.courier}
                                                </p>
                                                <p className="text-xs text-blue-600 pl-6">
                                                    AWB: {order.tracking.id}
                                                </p>
                                            </div>
                                            {order.tracking.link && (
                                                <a href={order.tracking.link} target="_blank" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                                                    Track <ExternalLink size={12}/>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* PRODUCT INFO */}
                                <div className="order-body border-t border-gray-100 mt-4">
                                    <img 
                                        src={order.product?.image || 'https://via.placeholder.com/100'} 
                                        className="order-img"
                                    />
                                    <div className="product-info">
                                        <h3>{order.product?.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: 1</p>
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