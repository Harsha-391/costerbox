/* src/app/secured/superadmin/add-product/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, storage } from '../../../../lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './add-product.css';

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', comparePrice: '', costPerItem: '',
    stock: '', sku: '', barcode: '', weight: '', hsCode: '',
    status: 'Active', category: 'Sarees', vendor: 'Costerbox',
    media: [] 
  });

  // MEDIA & CATEGORY STATE
  const [categories, setCategories] = useState(['Sarees', 'Lehengas', 'Suits', 'Fabrics', 'Menswear']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // FETCH DATA IF EDITING
  useEffect(() => {
    if (editId) {
      const fetchData = async () => {
        const docSnap = await getDoc(doc(db, "products", editId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({ ...data, media: data.media || (data.featuredImage ? [data.featuredImage] : []) });
        }
      };
      fetchData();
    }
  }, [editId]);

  // HANDLERS
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileSelect = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeMedia = (index, isExisting) => {
    if(isExisting) {
        const updated = formData.media.filter((_, i) => i !== index);
        setFormData({...formData, media: updated});
    } else {
        const updatedFiles = imageFiles.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setImageFiles(updatedFiles);
        setPreviews(updatedPreviews);
    }
  };

  const handleAddCategory = () => {
    if(newCat) {
        setCategories([...categories, newCat]);
        setFormData({...formData, category: newCat});
        setIsAddingCategory(false);
    }
  };

  // SUBMIT LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalMedia = [...formData.media];

      // Upload New Images
      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadPromises = imageFiles.map(async (file) => {
           const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
           await uploadBytes(storageRef, file);
           return await getDownloadURL(storageRef);
        });
        const newUrls = await Promise.all(uploadPromises);
        finalMedia = [...finalMedia, ...newUrls];
        setUploading(false);
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        media: finalMedia,
        featuredImage: finalMedia[0] || '',
        updatedAt: new Date()
      };

      if (editId) {
        await updateDoc(doc(db, "products", editId), payload);
        alert("Saved Changes!");
      } else {
        payload.createdAt = new Date();
        await addDoc(collection(db, "products"), payload);
        alert("Product Created!");
      }
      router.push('/secured/superadmin/manage-products');
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-actions">
        <h1 className="page-title">{editId ? 'Edit Product' : 'Add Product'}</h1>
        <button onClick={() => router.back()} className="btn-secondary" style={{color:'#000', borderColor:'#ddd'}}>
            Discard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="main-layout">
        
        {/* === LEFT COLUMN (MAIN CONTENT) === */}
        <div className="left-column">
            
            {/* 1. Title & Description */}
            <div className="card">
                <div className="form-group">
                    <label>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="Short sleeve t-shirt" required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <div className="rich-text-wrapper">
                        <div className="toolbar">
                            <span className="tool-btn">B</span>
                            <span className="tool-btn">I</span>
                            <span className="tool-btn">U</span>
                            <span className="tool-btn">Link</span>
                        </div>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="rich-editor" placeholder="Product details..."></textarea>
                    </div>
                </div>
            </div>

            {/* 2. Media */}
            <div className="card">
                <h3>Media</h3>
                <div className="media-dropzone">
                    <input type="file" multiple onChange={handleFileSelect} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}} />
                    <p>Add files or drop files to upload</p>
                </div>
                <div className="media-grid">
                    {formData.media.map((url, i) => (
                        <div key={i} className="media-item">
                            <img src={url} alt="media" />
                            <button type="button" onClick={() => removeMedia(i, true)} className="remove-media">×</button>
                        </div>
                    ))}
                    {previews.map((url, i) => (
                        <div key={i} className="media-item">
                            <img src={url} alt="preview" style={{opacity: 0.7}} />
                            <button type="button" onClick={() => removeMedia(i, false)} className="remove-media">×</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Pricing */}
            <div className="card">
                <h3>Pricing</h3>
                <div className="form-row">
                    <div className="form-col">
                        <label>Price</label>
                        <input name="price" type="number" value={formData.price} onChange={handleChange} className="input-field" placeholder="₹ 0.00" required />
                    </div>
                    <div className="form-col">
                        <label>Compare-at price</label>
                        <input name="comparePrice" type="number" value={formData.comparePrice} onChange={handleChange} className="input-field" placeholder="₹ 0.00" />
                        <div className="helper-text">To show a reduced price, move the original price here.</div>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-col">
                        <label>Cost per item</label>
                        <input name="costPerItem" type="number" value={formData.costPerItem} onChange={handleChange} className="input-field" placeholder="₹ 0.00" />
                        <div className="helper-text">Customers won't see this</div>
                    </div>
                </div>
            </div>

            {/* 4. Inventory */}
            <div className="card">
                <h3>Inventory</h3>
                <div className="form-row">
                    <div className="form-col">
                        <label>SKU (Stock Keeping Unit)</label>
                        <input name="sku" value={formData.sku} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="form-col">
                        <label>Barcode (ISBN, UPC, GTIN, etc.)</label>
                        <input name="barcode" value={formData.barcode} onChange={handleChange} className="input-field" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Quantity</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="input-field" style={{width: '150px'}} />
                </div>
            </div>

            {/* 5. Shipping */}
            <div className="card">
                <h3>Shipping</h3>
                <div className="form-row">
                    <div className="form-col">
                        <label>Weight (kg)</label>
                        <input name="weight" value={formData.weight} onChange={handleChange} className="input-field" placeholder="0.0" />
                    </div>
                    <div className="form-col">
                        <label>HS Code</label>
                        <input name="hsCode" value={formData.hsCode} onChange={handleChange} className="input-field" placeholder="Harmonized System Code" />
                    </div>
                </div>
            </div>

            {/* 6. SEO Preview */}
            <div className="card">
                <h3>Search engine listing</h3>
                <div style={{color: '#1a0dab', fontSize: '18px', fontWeight: '500'}}>{formData.title || "Product Title"}</div>
                <div style={{color: '#006621', fontSize: '14px'}}>https://costerbox.in/products/{formData.sku || '...'}</div>
                <div style={{color: '#545454', fontSize: '13px'}}>{formData.description ? formData.description.substring(0, 150) + "..." : "Product description goes here..."}</div>
            </div>

        </div>

        {/* === RIGHT COLUMN (SIDEBAR) === */}
        <div className="right-column">
            
            {/* Status */}
            <div className="card">
                <h3>Status</h3>
                <select name="status" value={formData.status} onChange={handleChange} className="select-field">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                </select>
                <div style={{marginTop:'10px'}}>
                    <span className={`status-badge ${formData.status === 'Active' ? 'status-active' : 'status-draft'}`}>
                        {formData.status}
                    </span>
                </div>
            </div>

            {/* Organization */}
            <div className="card">
                <h3>Product organization</h3>
                
                <div className="form-group">
                    <label>Category</label>
                    {!isAddingCategory ? (
                        <div style={{display:'flex', gap:'5px'}}>
                            <select name="category" value={formData.category} onChange={handleChange} className="select-field">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button type="button" onClick={() => setIsAddingCategory(true)} style={{border:'1px solid #ddd', background:'#fff', borderRadius:'4px', cursor:'pointer'}}>+</button>
                        </div>
                    ) : (
                        <div style={{display:'flex', gap:'5px'}}>
                            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} className="input-field" placeholder="New Category" autoFocus />
                            <button type="button" onClick={handleAddCategory} style={{background:'green', color:'#fff', border:'none', borderRadius:'4px', width:'30px'}}>✓</button>
                            <button type="button" onClick={() => setIsAddingCategory(false)} style={{background:'#d32f2f', color:'#fff', border:'none', borderRadius:'4px', width:'30px'}}>×</button>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Vendor</label>
                    <input name="vendor" value={formData.vendor} onChange={handleChange} className="input-field" />
                </div>

                <div className="form-group">
                    <label>Tags</label>
                    <input placeholder="Vintage, Cotton, Summer" className="input-field" />
                    <div className="helper-text">Separate tags with a comma</div>
                </div>
            </div>

        </div>

        {/* === SAVE FOOTER === */}
        <div className="save-bar">
            {uploading && <span style={{color:'#fff', alignSelf:'center'}}>Uploading Images...</span>}
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
        </div>

      </form>
    </div>
  );
}