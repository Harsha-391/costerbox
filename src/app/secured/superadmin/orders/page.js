/* src/app/secured/superadmin/orders/page.js */
"use client";
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Package, Truck, CheckCircle, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null); // The order currently being updated

    // 1. Fetch All Orders
    const fetchOrders = async () => {
        setLoading(true);
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    // 2. Function to Update Status & Add Tracking
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStatus = formData.get("status");
        const trackingId = formData.get("trackingId");
        const courier = formData.get("courier");
        const trackingLink = formData.get("trackingLink");

        try {
            const orderRef = doc(db, "orders", editingOrder.id);
            await updateDoc(orderRef, {
                status: newStatus,
                tracking: {
                    id: trackingId,
                    courier: courier,
                    link: trackingLink,
                    updatedAt: serverTimestamp()
                }
            });
            
            alert("Order Updated Successfully!");
            setEditingOrder(null); // Close modal
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Failed to update order.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Order Management</h1>

            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                    {order.orderId ? order.orderId.slice(-8) : order.id.slice(0,8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.shipping?.firstName} {order.shipping?.lastName}</div>
                                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.product?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {order.product?.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button 
                                        onClick={() => setEditingOrder(order)}
                                        className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded"
                                    >
                                        Update Tracking
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- UPDATE MODAL --- */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Update Order #{editingOrder.orderId?.slice(-6)}</h2>
                        
                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                                <select name="status" defaultValue={editingOrder.status} className="mt-1 block w-full p-2 border rounded">
                                    <option value="paid">Processing (Paid)</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Truck size={18}/> Tracking Details</h3>
                                <input 
                                    name="courier" 
                                    placeholder="Courier Name (e.g. BlueDart)" 
                                    defaultValue={editingOrder.tracking?.courier}
                                    className="block w-full p-2 border rounded mb-2 text-sm"
                                />
                                <input 
                                    name="trackingId" 
                                    placeholder="Tracking Number / AWB" 
                                    defaultValue={editingOrder.tracking?.id}
                                    className="block w-full p-2 border rounded mb-2 text-sm"
                                />
                                <input 
                                    name="trackingLink" 
                                    placeholder="Tracking URL (http://...)" 
                                    defaultValue={editingOrder.tracking?.link}
                                    className="block w-full p-2 border rounded mb-2 text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingOrder(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-white bg-black rounded hover:bg-gray-800"
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