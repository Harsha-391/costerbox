/* src/components/Header.js */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingBag, User, Menu, X, Package, LogOut } from 'lucide-react';
import '../styles/header.css'; 

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    
    // State for Mobile Menu & Search
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Hide Header on Admin/Secured pages (except Login)
    if (pathname.startsWith('/secured') && pathname !== '/secured/login') {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
        setMobileMenuOpen(false);
    };

    return (
        <nav className="nav-wrapper">
            <div className="nav-bar">
                
                {/* 1. MOBILE TOGGLE (Left) */}
                <div className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
                    <Menu size={22} />
                </div>

                {/* 2. LOGO (Center) */}
                <Link href="/" className="brand-logo">
                    {/* Ensure logo.png exists in /public folder */}
                    <img src="/logo.png" alt="CosterBox" className="logo-img" />
                </Link>

                {/* 3. DESKTOP ICONS (Right) */}
                <div className="desktop-icons">
                    <Link href="/shop" className="icon-link">Archive</Link>
                    
                    {/* Search Bar Logic */}
                    <div className={`search-container ${searchOpen ? 'active' : ''}`}>
                        <input type="text" className="search-input" placeholder="Search..." />
                        <button className="icon-link search-trigger" onClick={() => setSearchOpen(!searchOpen)}>
                            <Search size={20} />
                        </button>
                    </div>

                    <Link href="/cart" className="icon-link" title="Cart">
                        <ShoppingBag size={20} />
                    </Link>

                    {/* DYNAMIC USER SECTION */}
                    {user ? (
                        <>
                            <Link href="/orders" className="icon-link" title="My Orders">
                                <Package size={20} />
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="icon-link" 
                                title="Logout" 
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <Link href="/secured/login" className="icon-link" title="Login">
                            <User size={20} />
                        </Link>
                    )}
                </div>

                {/* 4. MOBILE RIGHT SECTION (Search + Cart) */}
                <div className="mobile-right-section">
                    <div className="mobile-search-trigger">
                        <Search size={20} />
                    </div>
                    <Link href="/cart" className="mobile-cart-link">
                        <ShoppingBag size={20} />
                    </Link>
                </div>
            </div>

            {/* --- MOBILE SIDEBAR MENU --- */}
            <div className={`mobile-menu-expansion ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <span className="menu-title">Menu</span>
                    <X className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} />
                </div>
                
                <Link href="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/shop" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Archive</Link>
                <Link href="/cart" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
                
                {user ? (
                    <>
                        <Link href="/orders" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                        <button 
                            className="mobile-link mobile-link-btn" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link href="/secured/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                )}
            </div>

            {/* OVERLAY */}
            <div 
                className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setMobileMenuOpen(false)}
            />
        </nav>
    );
}