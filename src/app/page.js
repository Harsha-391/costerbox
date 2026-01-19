/* src/app/page.js */
"use client";
import React from 'react';
import Link from 'next/link';
import '../styles/home.css';


export default function HomePage() {
  return (
    <>

      {/* 1. HERO SECTION (Kept simple to focus on categories below) */}
      <header className="hero-split">
        <div className="hero-content">
          <span className="overline">Est. 2024 • Jaipur, India</span>
          <h1>Tribal Art,<br/>Reimagined.</h1>
          <p>
            Experience a collection that is culturally rooted, refined, and consciously crafted.
          </p>
          <Link href="#products" className="btn-editorial">Explore Collections</Link>
        </div>
        <div className="hero-visual"></div>
      </header>

      {/* 2. SHOP BY CATEGORY (Circular Layout - Like PDF Page 2) */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">Shop By Category</h2>
          
          <div className="category-grid">
            {/* Item 1 */}
            <Link href="/category/clearance" className="category-item">
              <div className="cat-img-wrapper">
                <img src="img14.jpg" alt="Clearance" />
              </div>
              <span>Clearance Sale</span>
            </Link>

            {/* Item 2 */}
            <Link href="/category/anarkali" className="category-item">
              <div className="cat-img-wrapper">
                <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" alt="Anarkali" />
              </div>
              <span>Anarkali</span>
            </Link>

            {/* Item 3 */}
            <Link href="/category/dress" className="category-item">
              <div className="cat-img-wrapper">
                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" alt="Dress" />
              </div>
              <span>Dress</span>
            </Link>

            {/* Item 4 */}
            <Link href="/category/saree" className="category-item">
              <div className="cat-img-wrapper">
                <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop" alt="Saree" />
              </div>
              <span>Saree</span>
            </Link>

            {/* Item 5 */}
            <Link href="/category/gharara" className="category-item">
              <div className="cat-img-wrapper">
                <img src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop" alt="Gharara" />
              </div>
              <span>Gharara Set</span>
            </Link>

            {/* Item 6 */}
            <Link href="/category/menswear" className="category-item">
              <div className="cat-img-wrapper">
                <img src="https://images.unsplash.com/photo-1586227740560-8cf2732c1531?q=80&w=600&auto=format&fit=crop" alt="Menswear" />
              </div>
              <span>Menswear</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS / PRODUCTS (Card Layout - Like PDF Page 4) */}
      <section id="products" className="products-section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          
          <div className="product-grid">
            
            {/* Product 1 */}
            <div className="product-card">
              <div className="p-image">
                <img src="https://images.unsplash.com/photo-1583391733958-e026b1346338?q=80&w=800&auto=format&fit=crop" alt="Yalina Anarkali" />
                <span className="tag-new">New</span>
              </div>
              <div className="p-details">
                <h3>Yalina Anarkali Set Of 3</h3>
                <p className="price">₹16,850</p>
              </div>
            </div>

            {/* Product 2 */}
            <div className="product-card">
              <div className="p-image">
                <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop" alt="Nayab Anarkali" />
              </div>
              <div className="p-details">
                <h3>Nayab Anarkali Set Of 4</h3>
                <p className="price">₹18,500</p>
              </div>
            </div>

            {/* Product 3 */}
            <div className="product-card">
              <div className="p-image">
                <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop" alt="Bindiya Dress" />
              </div>
              <div className="p-details">
                <h3>Bindiya Dress</h3>
                <p className="price">₹12,990</p>
              </div>
            </div>

            {/* Product 4 */}
            <div className="product-card">
              <div className="p-image">
                <img src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop" alt="Gulshan Sharara" />
              </div>
              <div className="p-details">
                <h3>Gulshan Sharara Set Of 3</h3>
                <p className="price">₹17,500</p>
              </div>
            </div>

          </div>
          
          <div style={{textAlign: 'center', marginTop: '50px'}}>
             <Link href="/shop" className="btn-editorial">View All Products</Link>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US (Layout Like PDF Page 5) */}
      <section className="about-split-section">
        <div className="about-split-content">
          <span className="overline">About Us</span>
          <h2>A Story From The Roots</h2>
          <p>
            We know some things are special when they tell a story, something that comes from the roots of a culture creating a dialect between the user and provider.
          </p>
          <p>
            Costerbox proudly represents this vernacular story from the great state of Rajasthan which talks about the clothes that are made by the experienced hand of local craftsmanship passed down through generations.
          </p>
          <Link href="/about" className="link-underline">Read More</Link>
        </div>
        <div className="about-split-image">
           {/* Image of two women sitting, similar to PDF */}
           <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1887&auto=format&fit=crop" alt="Our Story" />
        </div>
      </section>

      {/* 5. TESTIMONIALS (Layout Like PDF Page 6) */}
      <section className="testimonials-section">
        <div className="container">
          <span className="overline">From The People</span>
          <div className="testimonial-grid">
            
            <div className="testimonial-card">
               <p>"Thanks team, I have received the order. For sure. I am definitely going to recommend you guys for your quick service."</p>
               <h5>— Aanisah (Spain)</h5>
            </div>

            <div className="testimonial-card">
               <p>"Good afternoon. I received my two outfits. They are GORGEOUS!! Will send photos when I wear them. Thank you a million."</p>
               <h5>— Bea (Kenya)</h5>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}