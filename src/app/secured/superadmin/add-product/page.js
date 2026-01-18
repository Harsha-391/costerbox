/* src/app/secured/superadmin/page.js */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // --- PRODUCT FORM STATE (Shopify Style) ---
  const [product, setProduct] = useState({
    title: '',
    description: '', // HTML/Rich text placeholder
    price: '',
    comparePrice: '', // For "Sale" badges
    category: '',
    sizes: [], // Array of sizes
    media: [], // Array of { url, alt, id }
    status: 'Active',
    // SEO Fields
    metaTitle: '',
    metaDescription: '',
    handle: '', // URL slug
    tags: ''
  });

  const [sizeInput, setSizeInput] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCats = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCats();
  }, []);


  // --- 1. SMART IMAGE PROCESSING ---
  const handleImageUpload = async (files) => {
    setLoading(true);
    const uploadedMedia = [...product.media];

    for (let file of files) {
      // A. Validate Format
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert(`Skipped ${file.name}: Only JPG and PNG allowed.`);
        continue;
      }

      try {
        // B. Convert to WebP (Client-Side Compression)
        const webpBlob = await convertToWebP(file);
        
        // C. Upload to Firebase Storage
        const filename = `${Date.now()}-${file.name.split('.')[0]}.webp`;
        const storageRef = ref(storage, `products/${filename}`);
        
        await uploadBytes(storageRef, webpBlob);
        const downloadURL = await getDownloadURL(storageRef);

        // D. Add to State
        uploadedMedia.push({
            id: Date.now() + Math.random(),
            url: downloadURL,
            alt: product.title || 'Product Image'
        });

      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    setProduct(prev => ({ ...prev, media: uploadedMedia }));
    setLoading(false);
  };

  // Helper: Canvas Conversion
  const convertToWebP = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Convert to WebP at 0.8 quality
            canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
  };

  // --- 2. DATABASE ACTIONS ---
  const saveProduct = async () => {
    if (!product.title || product.media.length === 0) {
        alert("Please add a title and at least one image.");
        return;
    }

    setLoading(true);
    try {
        // Auto-Generate Search Keywords
        const searchKeywords = [
            ...product.title.toLowerCase().split(' '),
            product.category.toLowerCase(),
            ...product.tags.toLowerCase().split(',')
        ].filter(k => k.trim() !== '');

        // Prepare Data
        const payload = {
            name: product.title, // Mapping to your front-end "name"
            price: `₹${product.price}`,
            description: product.description,
            category: product.category,
            images: product.media.map(m => m.url), // Array of URLs
            mainImage: product.media[0].url, // First image is main
            sizes: product.sizes,
            seo: {
                title: product.metaTitle || product.title,
                description: product.metaDescription,
                altText: product.media.map(m => m.alt),
                tags: product.tags.split(',').map(t => t.trim())
            },
            keywords: searchKeywords,
            createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'products'), payload);
        alert("Product Saved Successfully!");
        window.location.reload();

    } catch (err) {
        console.error(err);
        alert("Error saving product.");
    } finally {
        setLoading(false);
    }
  };

  const createCategory = async () => {
      if(!newCategory) return;
      await addDoc(collection(db, 'categories'), { name: newCategory });
      setNewCategory('');
      // Refresh local list
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };


  // --- DRAG & DROP HANDLERS ---
  const dropRef = useRef(null);
  const handleDragOver = (e) => { e.preventDefault(); dropRef.current.style.borderColor = '#000'; };
  const handleDragLeave = (e) => { e.preventDefault(); dropRef.current.style.borderColor = '#ccc'; };
  const handleDrop = (e) => {
      e.preventDefault();
      dropRef.current.style.borderColor = '#ccc';
      if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleImageUpload(e.dataTransfer.files);
      }
  };

  return (
    <div style={{ backgroundColor: '#f6f6f7', minHeight: '100vh', padding: '30px' }}>
      
      {/* HEADER */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Add Product</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Discard</button>
             <button onClick={saveProduct} disabled={loading} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving...' : 'Save Product'}
             </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* --- LEFT COLUMN (Main Info) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. TITLE & DESC */}
            <div style={styles.card}>
                <label style={styles.label}>Title</label>
                <input 
                    style={styles.input} 
                    placeholder="Short Sleeve T-Shirt"
                    value={product.title}
                    onChange={(e) => setProduct({...product, title: e.target.value})}
                />

                <label style={styles.label}>Description</label>
                <textarea 
                    style={{...styles.input, height: '150px', resize: 'vertical'}} 
                    placeholder="Product details..."
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                />
            </div>

            {/* 2. MEDIA (Drag & Drop) */}
            <div style={styles.card}>
                <label style={styles.label}>Media</label>
                <div 
                    ref={dropRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={styles.dropZone}
                >
                    <p style={{marginBottom: '10px'}}>Drag & Drop images here (JPG/PNG)</p>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png"
                        onChange={(e) => handleImageUpload(e.target.files)} 
                        style={{display: 'none'}}
                        id="fileElem"
                    />
                    <label htmlFor="fileElem" style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>or click to browse</label>
                    <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}>Auto-converted to WebP. 4:5 Ratio Recommended.</p>
                </div>

                {/* Media Preview Grid */}
                {product.media.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '20px' }}>
                        {product.media.map((img, index) => (
                            <div key={img.id} style={{ position: 'relative', aspectRatio: '4/5', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {/* Alt Text Input on Hover? kept simple for now */}
                                <input 
                                    placeholder="Alt Text" 
                                    value={img.alt}
                                    onChange={(e) => {
                                        const newMedia = [...product.media];
                                        newMedia[index].alt = e.target.value;
                                        setProduct({...product, media: newMedia});
                                    }}
                                    style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', border: 'none', padding: '5px', fontSize: '10px', background: 'rgba(255,255,255,0.9)' }}
                                />
                                <button 
                                    onClick={() => setProduct(prev => ({...prev, media: prev.media.filter(m => m.id !== img.id)}))}
                                    style={{position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                >&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. SEO */}
            <div style={styles.card}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h3 style={styles.cardTitle}>Search Engine Listing</h3>
                    <span style={{color: 'green', fontSize: '12px'}}>Edit SEO</span>
                </div>
                <label style={styles.label}>Page Title</label>
                <input style={styles.input} value={product.metaTitle} onChange={e => setProduct({...product, metaTitle: e.target.value})} />
                
                <label style={styles.label}>Meta Description</label>
                <textarea style={{...styles.input, height: '80px'}} value={product.metaDescription} onChange={e => setProduct({...product, metaDescription: e.target.value})} />
                
                <label style={styles.label}>URL Handle</label>
                <input style={styles.input} placeholder="product-slug-url" value={product.handle} onChange={e => setProduct({...product, handle: e.target.value})} />
            </div>

        </div>

        {/* --- RIGHT COLUMN (Organization) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Status</h3>
                <select 
                    style={styles.select}
                    value={product.status}
                    onChange={(e) => setProduct({...product, status: e.target.value})}
                >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Category</h3>
                
                {/* ADD NEW CATEGORY INPUT */}
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                    <input 
                        style={{...styles.input, marginBottom: 0}} 
                        placeholder="Create new..." 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button onClick={createCategory} style={{background: '#333', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px'}}>+</button>
                </div>

                <select 
                    style={styles.select}
                    value={product.category}
                    onChange={(e) => setProduct({...product, category: e.target.value})}
                >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Pricing</h3>
                <label style={styles.label}>Price (₹)</label>
                <input 
                    style={styles.input} 
                    type="number" 
                    placeholder="0.00"
                    value={product.price}
                    onChange={(e) => setProduct({...product, price: e.target.value})}
                />
                <label style={styles.label}>Compare-at price</label>
                <input 
                    style={styles.input} 
                    type="number" 
                    placeholder="0.00"
                    value={product.comparePrice}
                    onChange={(e) => setProduct({...product, comparePrice: e.target.value})}
                />
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Product Organization</h3>
                <label style={styles.label}>Sizes</label>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                    <input 
                        style={styles.input}
                        placeholder="Add size (e.g. S)"
                        value={sizeInput}
                        onChange={(e) => setSizeInput(e.target.value)}
                    />
                    <button onClick={() => {
                        if(sizeInput) {
                            setProduct(p => ({...p, sizes: [...p.sizes, sizeInput]}));
                            setSizeInput('');
                        }
                    }} style={{background: '#ddd', border: 'none', borderRadius: '4px'}}>Add</button>
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                    {product.sizes.map((s, i) => (
                        <span key={i} style={{background: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>{s}</span>
                    ))}
                </div>

                <label style={styles.label}>Tags (Comma separated)</label>
                <input 
                    style={styles.input} 
                    placeholder="Cotton, Summer, Sale"
                    value={product.tags}
                    onChange={(e) => setProduct({...product, tags: e.target.value})}
                />
            </div>

        </div>

      </div>
    </div>
  );
}

// --- CSS-IN-JS STYLES ---
const styles = {
    card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '15px' },
    label: { display: 'block', fontSize: '13px', marginBottom: '5px', color: '#444' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
    select: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
    dropZone: { 
        border: '2px dashed #ccc', 
        borderRadius: '6px', 
        padding: '40px', 
        textAlign: 'center', 
        background: '#fafafa',
        transition: 'border .2s ease'
    }
};