/* src/app/secured/superadmin/layout.js */
"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLayout({ children }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/secured/login');
            } else {
                // --- DYNAMIC CHECK ---
                // If role is NOT admin, kick them out.
                if (role !== 'admin') {
                    alert("Access Denied: You do not have Admin privileges.");
                    router.push('/'); // Or redirect artisans to /secured/artisan/orders
                }
            }
        }
    }, [user, role, loading, router]);

    if (loading || role !== 'admin') return <div style={{ padding: '50px', textAlign: 'center' }}>Verifying Access...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            {/* ... (Your Sidebar Code remains the same) ... */}
            <main style={{ flex: 1, padding: '40px' }}>{children}</main>
        </div>
    );
}