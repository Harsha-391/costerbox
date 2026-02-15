/* src/app/secured/superadmin/orders/page.js */
"use client";
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Package, Truck, CheckCircle, Clock, MapPin, ExternalLink, MessageCircle, AlertTriangle } from 'lucide-react';

import { Search } from 'lucide-react'; // Import Icon

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // Search State

    // ... (getTime, formatDate remain same) ...
    const getTime = (t) => {
        if (!t) return 0;
        if (typeof t.toMillis === 'function') return t.toMillis();
        if (t instanceof Date) return t.getTime();
        if (typeof t === 'number') return t;
        if (typeof t === 'string') return new Date(t).getTime();
        return 0;
    };

    const formatDate = (t) => {
        const time = getTime(t);
        return time ? new Date(time).toLocaleString() : 'N/A';
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // Try simple query first to get ALL documents, then sort in memory to avoid index issues with mix of fields
            const snapshot = await getDocs(collection(db, "orders"));
            const results = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // Robust Sort
            results.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

            setOrders(results);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Unable to load orders. Please check console for details.");
        }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    // Filter Logic
    const filteredOrders = orders.filter(o =>
        (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.orderId && o.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.shipping && o.shipping.firstName && o.shipping.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.shipping && o.shipping.lastName && o.shipping.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.shipping && o.shipping.phone && o.shipping.phone.includes(searchTerm))
    );

    // ... (handleShip, handleUpdateStatus, getStatusStyle remain same) ...
    const handleShip = async () => {
        if (!editingOrder) return;
        const displayId = editingOrder.orderId || editingOrder.id;
        if (!window.confirm(`Ship Order #${displayId}? This will create a shipment in Shiprocket.`)) return;

        try {
            const res = await fetch('/api/shiprocket/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: editingOrder.id })
            });
            const data = await res.json();

            if (data.success) {
                alert(`Shipment Created! ID: ${data.data.shipment_id}`);
                setEditingOrder(null);
                fetchOrders();
            } else {
                alert(`Failed: ${data.message || data.error}`);
            }
        } catch (e) {
            console.error(e);
            alert("Error creating shipment");
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const orderRef = doc(db, "orders", editingOrder.id);
            await updateDoc(orderRef, {
                status: formData.get("status"),
                tracking: {
                    id: formData.get("trackingId"),
                    courier: formData.get("courier"),
                    link: formData.get("trackingLink"),
                    updatedAt: serverTimestamp()
                }
            });

            alert("Order Updated Successfully!");
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            console.error(error);
            alert("Failed to update order.");
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'delivered') return { background: '#dcfce7', color: '#166534' };
        if (status === 'shipped') return { background: '#dbeafe', color: '#1e40af' };
        if (status === 'paid') return { background: '#e0f2fe', color: '#0369a1' };
        if (status === 'pending_artisan_acceptance') return { background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' };
        return { background: '#fef9c3', color: '#854d0e' }; // pending/processing
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#666', fontSize: '1.2rem' }}>Loading Orders...</div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>All Orders ({filteredOrders.length})</h1>

                <div style={{ display: 'flex', gap: '15px' }}>
                    {/* SEARCH BAR */}
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search Order ID, Name, Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '300px' }}
                        />
                    </div>
                    <button onClick={fetchOrders} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>Refresh</button>
                </div>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={thStyle}>Date & ID</th>
                            <th style={thStyle}>Customer</th>
                            <th style={thStyle}>Contact / Address</th>
                            <th style={thStyle}>Product</th>
                            <th style={thStyle}>Amount</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: '600', color: '#111' }}>
                                        {formatDate(order.createdAt).split(',')[0]}
                                    </div>
                                    <div style={{ fontFamily: 'monospace', color: '#888', marginTop: '4px' }}>
                                        #{order.orderId ? order.orderId : order.id ? order.id.slice(0, 6) : '---'}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                        {order.shipping?.firstName} {order.shipping?.lastName}
                                    </div>
                                    <div style={{ color: '#6b7280' }}>
                                        {order.userEmail}
                                    </div>
                                </td>
                                <td style={{ ...tdStyle, maxWidth: '250px', whiteSpace: 'normal' }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong style={{ color: '#444' }}>Ph:</strong> {order.shipping?.phone || 'N/A'}
                                    </div>
                                    <div style={{ color: '#666', lineHeight: '1.4' }}>
                                        {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.zip}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <img src={order.product?.image} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', background: '#eee' }} />
                                        <span style={{ color: '#374151' }}>{order.product?.name}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 'bold', color: '#111' }}>
                                        {order.product?.price}
                                    </div>
                                    <div style={{ fontSize: '11px', color: order.paymentMethod === 'CD' ? 'orange' : 'green', marginTop: '2px', fontWeight: '600' }}>
                                        {order.paymentMethod === 'CD' ? 'CASH ON DELIVERY' : 'PREPAID'}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '4px 10px', display: 'inline-block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                                        borderRadius: '20px', ...getStatusStyle(order.status)
                                    }}>
                                        {order.status || 'Pending'}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => setEditingOrder(order)}
                                        style={{
                                            color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px',
                                            borderRadius: '6px', background: '#eff6ff', cursor: 'pointer', fontWeight: '500',
                                            marginBottom: '5px', width: '100%'
                                        }}
                                    >
                                        Manage
                                    </button>

                                    {(order.isCustomOrder || order.isFlagged) && (
                                        <a
                                            href={`/secured/superadmin/live-chats?chatId=order_${order.id}&flagReason=${encodeURIComponent(order.flagReason || '')}`}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                                padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none',
                                                background: order.isFlagged ? '#fee2e2' : '#f0fdf4',
                                                color: order.isFlagged ? '#b91c1c' : '#15803d',
                                                border: order.isFlagged ? '1px solid #fca5a5' : '1px solid #bbf7d0',
                                                fontSize: '12px', fontWeight: 'bold'
                                            }}
                                        >
                                            {order.isFlagged ? <AlertTriangle size={14} /> : <MessageCircle size={14} />}
                                            {order.isFlagged ? 'Review Issue' : 'Chat'}
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                    No orders found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- UPDATE MODAL --- */}
            {editingOrder && (
                <div style={modalOverlay}>
                    <div style={modalBox}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                            Update Order #{editingOrder.orderId ? editingOrder.orderId.slice(-6) : editingOrder.id.slice(-6)}
                        </h2>

                        {/* --- SHIPROCKET SECTION (Primary Action) --- */}
                        {editingOrder.status !== 'shipped' && editingOrder.status !== 'delivered' && (
                            <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd6fe' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#5b21b6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={18} /> Automated Shipping
                                </h3>
                                <p style={{ fontSize: '13px', color: '#6d28d9', marginBottom: '12px' }}>
                                    Click below to automatically create a shipment, generate AWB, and notify the customer via Shiprocket.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleShip}
                                    style={{
                                        width: '100%', padding: '10px', color: '#fff', background: '#7c3aed',
                                        border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Truck size={18} /> Ship via Shiprocket
                                </button>
                            </div>
                        )}

                        {/* --- SHIPMENT INFO (If Shipped) --- */}
                        {editingOrder.shiprocketOrderId && (
                            <div style={{ padding: '12px', background: '#ecfccb', marginBottom: '20px', borderRadius: '8px', border: '1px solid #d9f99d' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#365314', fontWeight: '600' }}>
                                    ✅ Shiprocket Order Linked: #{editingOrder.shiprocketOrderId}
                                </p>
                                {editingOrder.awbCode && (
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#365314' }}>
                                        AWB: {editingOrder.awbCode}
                                    </p>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleUpdateStatus}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Order Status</label>
                                <select name="status" defaultValue={editingOrder.status} style={inputStyle}>
                                    <option value="paid">Processing (Paid)</option>
                                    <option value="pending_artisan_acceptance">Pending Artisan Acceptance</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {/* MANUAL TRACKING TOGGLE */}
                            <details style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', cursor: 'pointer' }}>
                                <summary style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>
                                    Is this a Manual / Offline Shipment?
                                </summary>
                                <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '8px' }}>
                                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                        Only fill these details if you shipped this order <strong>outside</strong> of Shiprocket (e.g. manually via Post Office or local courier).
                                    </p>
                                    <input
                                        name="courier"
                                        placeholder="Courier Name (e.g. BlueDart)"
                                        defaultValue={editingOrder.tracking?.courier}
                                        style={{ ...inputStyle, marginBottom: '8px' }}
                                    />
                                    <input
                                        name="trackingId"
                                        placeholder="Tracking Number / AWB"
                                        defaultValue={editingOrder.tracking?.id}
                                        style={{ ...inputStyle, marginBottom: '8px' }}
                                    />
                                    <input
                                        name="trackingLink"
                                        placeholder="Tracking URL (http://...)"
                                        defaultValue={editingOrder.tracking?.link}
                                        style={{ ...inputStyle, marginBottom: '8px' }}
                                    />
                                </div>
                            </details>


                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    style={{ padding: '8px 16px', color: '#374151', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={{ padding: '8px 16px', color: '#fff', background: '#1a1a1a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Save Updates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = {
    padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500',
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '16px 24px', whiteSpace: 'nowrap'
};

const modalOverlay = {
    position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
};

const modalBox = {
    background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '28rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
};

const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px'
};

const inputStyle = {
    display: 'block', width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
};