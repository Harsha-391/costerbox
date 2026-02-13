/* src/app/page.js */
"use client";
import React from 'react';
import Link from 'next/link';
import '@/styles/home.css';

export default function HomePage() {
  return (
    <>
      {/* 1. HERO SECTION */}
      <header className="hero-split">
        <div className="hero-content">
          <span className="overline">Est. 2024 • Jaipur, India</span>
          <h1 className="hero-title">Tribal Art,<br />Reimagined.</h1>
          <p className="hero-desc">
            Experience a collection that is culturally rooted, refined, and consciously crafted.
          </p>
          <div>
            <Link href="/shop" className="btn-editorial">Explore Collections</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="img14.jpg"
            alt="Tribal Hero"
            className="hero-img"
          />
        </div>
      </header>

      {/* 2. CATEGORIES */}
      <section className="category-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontFamily: '"Playfair Display", serif', fontSize: '2rem', marginBottom: '50px' }}>
            Shop By Category
          </h2>

          <div className="cat-grid">
            {[
              { name: 'Clearance', img: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400', link: '/shop?cat=Clearance' },
              { name: 'Anarkali', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', link: '/shop?cat=Anarkali' },
              { name: 'Dress', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', link: '/shop?cat=Dress' },
              { name: 'Saree', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400', link: '/shop?cat=Saree' },
              { name: 'Gharara', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', link: '/shop?cat=Gharara' },
              { name: 'Menswear', img: 'https://images.unsplash.com/photo-1586227740560-8cf2732c1531?w=400', link: '/shop?cat=Menswear' }
            ].map((item) => (
              <Link href={item.link} key={item.name} className="cat-item">
                <div className="cat-circle">
                  <img src={item.img} alt={item.name} />
                </div>
                <span className="cat-name">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section id="products" className="products-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontFamily: '"Playfair Display", serif', fontSize: '2rem', marginBottom: '50px' }}>
            New Arrivals
          </h2>

          <div className="prod-grid">
            {[
              { name: 'Yalina Anarkali Set', price: '₹16,850', img: 'https://images.unsplash.com/photo-1583391733958-e026b1346338?w=800' },
              { name: 'Nayab Anarkali Set', price: '₹18,500', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800' },
              { name: 'Bindiya Dress', price: '₹12,990', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800' },
              { name: 'Gulshan Sharara', price: '₹17,500', img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800' }
            ].map((p, i) => (
              <div key={i} className="prod-card">
                <div className="prod-image-box">
                  <img src={p.img} alt={p.name} />
                  {i === 0 && <span className="tag-new">New</span>}
                </div>
                <div className="prod-details">
                  <h3 className="prod-title">{p.name}</h3>
                  <p className="prod-price">{p.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/shop" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US */}
      <section className="about-split">
        <div className="about-text">
          <span className="overline">About Us</span>
          <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>A Story From The Roots</h2>
          <p className="hero-desc">
            We know some things are special when they tell a story, something that comes from the roots of a culture creating a dialect between the user and provider.
          </p>
          <p className="hero-desc">
            Costerbox proudly represents this vernacular story from the great state of Rajasthan which talks about the clothes that are made by the experienced hand of local craftsmanship.
          </p>
          <Link href="/about" style={{ textDecoration: 'underline', color: '#1a1a1a', fontSize: '14px', fontWeight: 'bold' }}>Read More</Link>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop" alt="Our Story" />
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section style={{ padding: '100px 0', background: '#1a1a1a', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <span className="overline" style={{ opacity: 0.6 }}>From The People</span>
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6' }}>
              "Thanks team, I have received the order. For sure. I am definitely going to recommend you guys for your quick service."
            </p>
            <h5 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>— Aanisah (Spain)</h5>
          </div>
        </div>
      </section>
    </>
  );
}