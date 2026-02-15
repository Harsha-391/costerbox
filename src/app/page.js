/* src/app/page.js */
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import '@/styles/home.css';

export default function HomePage() {
  // ========= STATE =========
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Dynamic data from Firestore
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========= FETCH DATA FROM FIRESTORE =========
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catSnap = await getDocs(collection(db, 'categories'));
        const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.name);
        setCategories(cats);

        // Fetch products
        const prodSnap = await getDocs(collection(db, 'products'));
        const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllProducts(prods);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ========= DERIVE PRODUCT SECTIONS FROM TAGS =========
  const newArrivals = allProducts.filter(p =>
    Array.isArray(p.tags) && p.tags.includes('new-arrival') && p.status === 'Active'
  ).slice(0, 8);

  const bestsellers = allProducts.filter(p =>
    Array.isArray(p.tags) && p.tags.includes('bestseller') && p.status === 'Active'
  ).slice(0, 8);

  // Featured products (fallback to latest if no tags)
  const featuredProducts = allProducts.filter(p =>
    Array.isArray(p.tags) && p.tags.includes('featured') && p.status === 'Active'
  ).slice(0, 8);

  // Get product image
  const getProductImage = (product, index = 0) => {
    if (index === 0) {
      return product.featuredImage || (product.media && product.media[0]) || 'https://via.placeholder.com/400x600?text=No+Image';
    }
    // Second image for hover
    if (product.media && product.media.length > 1) return product.media[1];
    return product.featuredImage || (product.media && product.media[0]) || '';
  };

  // ========= HERO SLIDER =========
  const heroSlides = [
    {
      image: '/heroimage.png',
      subtitle: 'Est. 2024 • Jaipur, India',
      title: 'TRIBAL ART,\nREIMAGINED.',
      cta: 'Shop Now',
      link: '/products',
      align: 'center'
    },
    {
      image: '/img14.jpg',
      subtitle: 'Ready to Ship',
      title: 'DISPATCH WITHIN\n72 HOURS',
      cta: 'Shop Collection',
      link: '/products',
      align: 'left'
    }
  ];

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }, [currentSlide, heroSlides.length, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // ========= TESTIMONIALS =========
  const testimonials = [
    { text: "Thanks team, I have received the order. For sure. I am definitely going to recommend you guys for your quick service.", author: "Aanisah", location: "Spain" },
    { text: "I got my outfit and I'm just blown by how beautiful the outfit and packaging is. Amazing fit! Will definitely be ordering again very soon.", author: "Priya K.", location: "Mumbai" },
    { text: "Thanks for the saree! Wore it for my pre wedding shoot. Loved it!! Thanks for the saree and on time delivery!", author: "Meera R.", location: "Bangalore" },
    { text: "Hi thank you, your products are very nice! I have shared the links with some friends too and love that you have plus sizes!", author: "Sarah M.", location: "London" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // ========= Product Card Component =========
  const ProductCard = ({ product }) => {
    const img1 = getProductImage(product, 0);
    const img2 = getProductImage(product, 1);
    const name = product.title || product.name || 'Product';
    const price = product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : '';
    const comparePrice = product.comparePrice ? `₹${Number(product.comparePrice).toLocaleString('en-IN')}` : '';

    // Determine tag to show
    let tag = null;
    if (Array.isArray(product.tags)) {
      if (product.tags.includes('new-arrival')) tag = 'New';
      else if (product.tags.includes('bestseller')) tag = 'Bestseller';
      else if (product.tags.includes('sale')) tag = 'Sale';
    }
    if (product.badge) tag = product.badge;

    return (
      <Link href={`/shop/${product.id}`} className="pc-card">
        <div className="pc-image-box">
          <img src={img1} alt={name} className="pc-img pc-img-primary" />
          {img2 && img2 !== img1 && <img src={img2} alt={name} className="pc-img pc-img-hover" />}
          {tag && (
            <span className={`pc-tag ${tag === 'Sale' ? 'pc-tag-sale' : tag === 'Bestseller' ? 'pc-tag-best' : ''}`}>
              {tag}
            </span>
          )}
          <button className="pc-quick-add" onClick={(e) => { e.preventDefault(); }}>
            Quick View
          </button>
        </div>
        <div className="pc-details">
          <h3 className="pc-name">{name}</h3>
          <div className="pc-pricing">
            <span className="pc-price">{price}</span>
            {comparePrice && <span className="pc-compare">{comparePrice}</span>}
          </div>
        </div>
      </Link>
    );
  };

  // ========= CATEGORY IMAGE (use first product image from that category) =========
  const getCategoryImage = (catName) => {
    const product = allProducts.find(p => p.category === catName && (p.featuredImage || (p.media && p.media.length > 0)));
    if (product) return product.featuredImage || product.media[0];
    return 'https://via.placeholder.com/400x600?text=' + encodeURIComponent(catName);
  };

  const getCategoryCount = (catName) => {
    return allProducts.filter(p => p.category === catName && p.status === 'Active').length;
  };

  // ========= RENDER =========
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#888' }}>
        Loading...
      </div>
    );
  }

  return (
    <>


      {/* ============ 2. HERO SLIDER ============ */}
      <section className="hero-slider">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-overlay" />
            <div className={`hero-content hero-${slide.align}`}>
              <span className="hero-subtitle">{slide.subtitle}</span>
              <h1 className="hero-heading">{slide.title}</h1>
              <Link href={slide.link} className="hero-cta">{slide.cta}</Link>
            </div>
          </div>
        ))}

        {heroSlides.length > 1 && (
          <>
            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            <button className="hero-arrow hero-arrow-left" onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}>‹</button>
            <button className="hero-arrow hero-arrow-right" onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}>›</button>
          </>
        )}
      </section>

      {/* ============ 3. NEW ARRIVALS (from Firestore tags) ============ */}
      {newArrivals.length > 0 && (
        <section className="section-products">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">New Arrivals</h2>
              <Link href="/products?cat=new-arrival" className="section-link">Shop All →</Link>
            </div>
            <div className="products-grid">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 4. BESTSELLERS (from Firestore tags) ============ */}
      {bestsellers.length > 0 && (
        <section className="section-products section-alt">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Bestsellers</h2>
              <Link href="/products?cat=bestseller" className="section-link">Shop All →</Link>
            </div>
            <div className="products-grid">
              {bestsellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 5. FEATURED (from Firestore tags) ============ */}
      {featuredProducts.length > 0 && (
        <section className="section-products">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured</h2>
              <Link href="/products?cat=featured" className="section-link">Shop All →</Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FALLBACK: ALL PRODUCTS if no tags exist ============ */}
      {newArrivals.length === 0 && bestsellers.length === 0 && featuredProducts.length === 0 && allProducts.length > 0 && (
        <section className="section-products">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Products</h2>
              <Link href="/products" className="section-link">Shop All →</Link>
            </div>
            <div className="products-grid">
              {allProducts.filter(p => p.status === 'Active').slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 6. SHOP BY CATEGORY (Dynamic from Firestore) ============ */}
      {categories.length > 0 && (
        <section className="section-category">
          <div className="container">
            <h2 className="section-title-center">Shop By Category</h2>
            <div className="cat-round-grid">
              {categories.map((cat) => (
                <Link href={`/products?cat=${encodeURIComponent(cat.name)}`} key={cat.id} className="cat-round-item">
                  <div className="cat-round-img-wrap">
                    <img src={getCategoryImage(cat.name)} alt={cat.name} />
                  </div>
                  <h3 className="cat-round-name">{cat.name}</h3>
                  <span className="cat-round-count">{getCategoryCount(cat.name)} Items</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 7. ABOUT US ============ */}
      <section className="section-about">
        <div className="about-image-side">
          <img src="/img14.jpg" alt="Our Story" />
        </div>
        <div className="about-text-side">
          <span className="about-label">About Us</span>
          <h2 className="about-heading">A Story From The Roots</h2>
          <p>
            We know some things are special when they tell a story, something that comes from the roots of a culture creating a dialect between the user and provider.
          </p>
          <p>
            Costerbox proudly represents this vernacular story from the great state of Rajasthan which talks about the clothes that are made by the experienced hand of local craftsmanship passed down through generations, their great knowledge of sustainable fabric and hand-worked details that outline beautiful minimalistic design.
          </p>
          <Link href="/about" className="about-cta">Read More</Link>
        </div>
      </section>

      {/* ============ 8. FEATURED IN ============ */}
      <section className="section-featured">
        <h2 className="section-title-center" style={{ fontSize: '1.3rem', marginBottom: '40px' }}>Featured In</h2>
        <div className="featured-logos">
          <div className="featured-logo">Vogue</div>
          <div className="featured-logo">Elle</div>
          <div className="featured-logo">Harper's Bazaar</div>
          <div className="featured-logo">WedMeGood</div>
          <div className="featured-logo">Khush Magazine</div>
        </div>
      </section>

      {/* ============ 9. TESTIMONIALS ============ */}
      <section className="section-testimonials">
        <div className="container">
          <span className="testi-overline">From The People</span>
          <div className="testi-slider">
            {testimonials.map((t, i) => (
              <div key={i} className={`testi-item ${i === currentTestimonial ? 'active' : ''}`}>
                <p className="testi-text">"{t.text}"</p>
                <h5 className="testi-author">— {t.author} ({t.location})</h5>
              </div>
            ))}
          </div>
          <div className="testi-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`testi-dot ${i === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 10. NEWSLETTER ============ */}
      <section className="section-newsletter">
        <div className="container">
          <h3 className="nl-heading">Subscribe to Offers & Newsletters</h3>
          <p className="nl-text">Be the first to know about new collections, exclusive offers, and more.</p>
          <form className="nl-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" className="nl-input" />
            <button type="submit" className="nl-btn">Subscribe</button>
          </form>
          <p className="nl-disclaimer">*By completing this form you're signing up to receive our emails and can unsubscribe at any time.</p>
        </div>
      </section>
    </>
  );
}