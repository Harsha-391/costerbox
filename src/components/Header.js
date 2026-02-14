/* src/components/Header.js */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, ShoppingBag, User, Menu, X, Package, LogOut, ChevronDown } from 'lucide-react';
import '../styles/header.css';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    // State for Mobile Menu, Search & Products Dropdown
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [productsOpen, setProductsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const dropdownRef = useRef(null);

    // Hide Header on Admin/Secured pages (except Login)
    if (pathname.startsWith('/secured') && pathname !== '/secured/login') {
        return null;
    }

    // Fetch categories from Firestore
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catSnap = await getDocs(collection(db, 'categories'));
                const cats = catSnap.docs.map(d => d.data().name).filter(Boolean);
                setCategories(cats);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProductsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    <img src="/logo.png" alt="CosterBox" className="logo-img" />
                </Link>

                {/* 3. DESKTOP ICONS (Right) */}
                <div className="desktop-icons">

                    {/* Products Dropdown */}
                    <div className="nav-dropdown" ref={dropdownRef}>
                        <button
                            className="icon-link nav-dropdown-trigger"
                            onClick={() => setProductsOpen(!productsOpen)}
                        >
                            Products <ChevronDown size={14} className={`chevron ${productsOpen ? 'open' : ''}`} />
                        </button>

                        {productsOpen && (
                            <div className="nav-dropdown-menu">
                                <Link href="/shop" className="nav-dropdown-item" onClick={() => setProductsOpen(false)}>
                                    All Products
                                </Link>
                                {categories.length > 0 && (
                                    <div className="nav-dropdown-divider" />
                                )}
                                {categories.map((cat, i) => (
                                    <Link
                                        href={`/shop?cat=${encodeURIComponent(cat)}`}
                                        key={i}
                                        className="nav-dropdown-item"
                                        onClick={() => setProductsOpen(false)}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

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

                {/* Mobile Products Section */}
                <div className="mobile-link mobile-section-title">Products</div>
                <Link href="/shop" className="mobile-link mobile-sublink" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                {categories.map((cat, i) => (
                    <Link
                        href={`/shop?cat=${encodeURIComponent(cat)}`}
                        key={i}
                        className="mobile-link mobile-sublink"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {cat}
                    </Link>
                ))}

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