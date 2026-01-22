/* src/app/secured/superadmin/add-product/page.js */
"use client";
import React, { useState } from 'react';
import { db, storage } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  
  // --- MEDIA STATE (Modified for Multiple) ---
  // Each item: { file: FileObj, url: 'blob:..', id: 123 }
  const [mediaFiles, setMediaFiles] = useState([]); 
  const [featuredIndex, setFeaturedIndex] = useState(0); // Default to first image

  // --- FORM STATE ---
  const [product, setProduct] = useState({
    title: '',
    description: '',
    status: 'Active',
    category: 'Sarees',
    price: '',
    comparePrice: '',
    costPerItem: '',
    cashOnDelivery: false, 
    stock: '1',
    sizes: [], 
    tags: [],
    seoTitle: '',
    seoDesc: '',
    handle: ''
  });

  // Temp inputs
  const [tempSize, setTempSize] = useState('');
  const [tempTag, setTempTag] = useState('');

  // 1. MULTI-IMAGE HANDLER
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newMedia = filesArray.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setMediaFiles((prev) => [...prev, ...newMedia]);
    }
  };

  const removeImage = (indexToRemove) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    // If we removed the featured one, reset featured to 0
    if (featuredIndex === indexToRemove) setFeaturedIndex(0);
    // If we removed one before the featured one, shift index down
    if (indexToRemove < featuredIndex) setFeaturedIndex(prev => prev - 1);
  };

  // 2. HELPER: ADD ARRAY ITEM
  const addArrayItem = (type, value, setter) => {
    if (!value.trim()) return;
    setProduct(prev => ({ ...prev, [type]: [...prev[type], value] }));
    setter('');
  };
  const removeArrayItem = (type, index) => {
    setProduct(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };

  // 3. SUBMIT HANDLER (Bulk Upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.title) return alert("Title is required");
    if (mediaFiles.length === 0) return alert("At least one image is required");

    setLoading(true);
    try {
      // A. Upload ALL Images to Storage
      const uploadPromises = mediaFiles.map(async (mediaItem) => {
        const uniqueName = `${Date.now()}_${mediaItem.file.name}`;
        const storageRef = ref(storage, `products/${uniqueName}`);
        const snapshot = await uploadBytes(storageRef, mediaItem.file);
        return await getDownloadURL(snapshot.ref);
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // B. Determine Featured Image
      // The image at 'featuredIndex' becomes the main 'featuredImage'
      const mainImage = uploadedUrls[featuredIndex] || uploadedUrls[0];

      // C. Save to Firestore
      await addDoc(collection(db, 'products'), {
        ...product,
        price: Number(product.price),
        comparePrice: Number(product.comparePrice),
        stock: Number(product.stock),
        
        // Save the Array AND the specific Featured Link
        media: uploadedUrls, 
        featuredImage: mainImage, 

        createdAt: serverTimestamp(),
        searchKeywords: [...product.title.toLowerCase().split(' '), ...product.tags.map(t=>t.toLowerCase())]
      });

      alert("Product Saved Successfully!");
      
      // Reset
      setProduct({ ...product, title: '', description: '', sizes: [], tags: [] });
      setMediaFiles([]);
      setFeaturedIndex(0);

    } catch (error) {
      console.error("Error:", error);
      alert("Save failed. See console.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Add Product</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button disabled={loading} onClick={handleSubmit} style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: loading?0.7:1 }}>
                {loading ? 'Saving...' : 'Save Product'}
            </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TITLE & DESC */}
            <div style={styles.card}>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Title</label>
                    <input style={styles.input} placeholder="Short Sleeve T-Shirt" value={product.title} onChange={(e) => setProduct({...product, title: e.target.value})} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea style={{...styles.input, minHeight: '150px'}} placeholder="Product details..." value={product.description} onChange={(e) => setProduct({...product, description: e.target.value})} />
                </div>
            </div>

            {/* MEDIA (Multi-Upload) */}
            <div style={styles.card}>
                <label style={styles.label}>Media</label>
                
                {/* Upload Box */}
                <div style={{ border: '2px dashed #ccc', borderRadius: '6px', padding: '20px', textAlign: 'center', background: '#fafafa', marginBottom: '20px' }}>
                    <p style={{marginBottom: '10px', fontWeight: '500'}}>Drag & Drop images here</p>
                    <label style={{ color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}>
                        Add Files
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{display:'none'}} />
                    </label>
                </div>

                {/* Gallery Grid */}
                {mediaFiles.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {mediaFiles.map((item, index) => (
                      <div key={item.id} style={{ position: 'relative', border: index === featuredIndex ? '2px solid #00c853' : '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        
                        <img 
                          src={item.url} 
                          alt="preview" 
                          style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer' }} 
                          onClick={() => setFeaturedIndex(index)} // Click to make featured
                        />
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => removeImage(index)}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                        >
                          ×
                        </button>

                        {/* Featured Badge */}
                        {index === featuredIndex && (
                          <div style={{ position: 'absolute', bottom: 0, width: '100%', background: '#00c853', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '2px' }}>
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* SEO */}
            <div style={styles.card}>
                <h3 style={{fontSize:'16px', fontWeight:'bold', marginBottom:'15px'}}>Search Engine Listing</h3>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Page Title</label>
                    <input style={styles.input} value={product.seoTitle} onChange={e=>setProduct({...product, seoTitle:e.target.value})} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Meta Description</label>
                    <textarea style={styles.input} value={product.seoDesc} onChange={e=>setProduct({...product, seoDesc:e.target.value})} />
                </div>
            </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* STATUS */}
            <div style={styles.card}>
                <label style={styles.label}>Status</label>
                <select style={styles.input} value={product.status} onChange={(e) => setProduct({...product, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {/* ORG */}
            <div style={styles.card}>
                <h3 style={{fontSize:'16px', fontWeight:'bold', marginBottom:'15px'}}>Product Organization</h3>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Category</label>
                    <select style={styles.input} value={product.category} onChange={(e) => setProduct({...product, category: e.target.value})}>
                        <option value="Sarees">Sarees</option>
                        <option value="Lehengas">Lehengas</option>
                        <option value="Suits">Suits</option>
                    </select>
                </div>

                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Sizes</label>
                    <div style={{display:'flex', gap:'5px'}}>
                        <input style={styles.input} placeholder="e.g. S" value={tempSize} onChange={e=>setTempSize(e.target.value)} onKeyDown={e => {if(e.key === 'Enter'){e.preventDefault(); addArrayItem('sizes', tempSize, setTempSize);}}} />
                        <button type="button" onClick={()=>addArrayItem('sizes', tempSize, setTempSize)} style={styles.addBtn}>Add</button>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'5px'}}>
                        {product.sizes.map((s, i) => (
                            <span key={i} style={styles.chip}>{s} <span onClick={()=>removeArrayItem('sizes',i)} style={{cursor:'pointer', marginLeft:'5px'}}>×</span></span>
                        ))}
                    </div>
                </div>

                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Tags</label>
                    <input style={styles.input} placeholder="Cotton, Summer" value={tempTag} onChange={e=>setTempTag(e.target.value)} onKeyDown={e => {if(e.key === 'Enter'){e.preventDefault(); addArrayItem('tags', tempTag, setTempTag);}}} />
                    <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'5px'}}>
                        {product.tags.map((t, i) => (
                            <span key={i} style={styles.chip}>{t} <span onClick={()=>removeArrayItem('tags',i)} style={{cursor:'pointer', marginLeft:'5px'}}>×</span></span>
                        ))}
                    </div>
                </div>
            </div>

            {/* PRICING */}
            <div style={styles.card}>
                <h3 style={{fontSize:'16px', fontWeight:'bold', marginBottom:'15px'}}>Pricing</h3>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Price (₹)</label>
                    <input type="number" style={styles.input} placeholder="0.00" value={product.price} onChange={e=>setProduct({...product, price:e.target.value})} />
                </div>
                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Compare-at price</label>
                    <input type="number" style={styles.input} placeholder="0.00" value={product.comparePrice} onChange={e=>setProduct({...product, comparePrice:e.target.value})} />
                </div>
                
                {/* COD */}
                <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        <input type="checkbox" checked={product.cashOnDelivery} onChange={(e) => setProduct({...product, cashOnDelivery: e.target.checked})} style={{ marginRight: '8px' }} />
                        Enable Cash on Delivery
                    </label>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
    card: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    fieldGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#333' },
    input: { width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '4px', outline: 'none', fontSize: '14px' },
    chip: { background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center' },
    addBtn: { padding: '0 15px', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#555' }
};