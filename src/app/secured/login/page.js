/* src/app/secured/login/page.js */
"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [data, setData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(data.email, data.password);
            router.push('/secured/superadmin'); // Redirect on success
        } catch (err) {
            setError('Invalid credentials. Access denied.');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Admin Portal</h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Please identify yourself.</p>
                </div>

                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '600' }}>Email</label>
                        <input
                            type="email"
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '600' }}>Password</label>
                        <input
                            type="password"
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            value={data.password}
                            onChange={e => setData({ ...data, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px',
                            padding: '12px',
                            background: '#1a1a1a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '20px' }}>
                    Unauthorized access is prohibited. <br /> IP Address logged.
                </p>
            </div>
        </div>
    );
}