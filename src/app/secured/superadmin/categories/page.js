/* src/app/secured/superadmin/categories/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [adding, setAdding] = useState(false);

    // FETCH CATEGORIES
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const cats = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching categories: ", error);
        } finally {
            setLoading(false);
        }
    };

    // ADD CATEGORY
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setAdding(true);
        try {
            await addDoc(collection(db, 'categories'), {
                name: newCategory.trim(),
                createdAt: new Date()
            });
            setNewCategory('');
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error adding category: ", error);
            alert("Failed to add category.");
        } finally {
            setAdding(false);
        }
    };

    // DELETE CATEGORY
    const handleDeleteCategory = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'categories', id));
            setCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (error) {
            console.error("Error deleting category: ", error);
            alert("Failed to delete category.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <button onClick={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} /></button>
                    <h1 style={styles.title}>Manage Categories</h1>
                </div>
                <div style={styles.countBadge}>{categories.length} Categories</div>
            </div>

            <div style={styles.content}>

                {/* ADD NEW FORM */}
                <div style={styles.addSection}>
                    <h3 style={styles.sectionTitle}>Add New Category</h3>
                    <form onSubmit={handleAddCategory} style={styles.form}>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name (e.g. Sarees)"
                            style={styles.input}
                            disabled={adding}
                        />
                        <button type="submit" style={styles.addBtn} disabled={adding || !newCategory.trim()}>
                            {adding ? 'Adding...' : <><Plus size={18} /> Add Category</>}
                        </button>
                    </form>
                </div>

                {/* CATEGORY LIST */}
                <div style={styles.listSection}>
                    <h3 style={styles.sectionTitle}>All Categories</h3>
                    {loading ? (
                        <p style={{ color: '#666' }}>Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No categories found.</p>
                    ) : (
                        <div style={styles.grid}>
                            {categories.map((cat) => (
                                <div key={cat.id} style={styles.card}>
                                    <span style={styles.catName}>{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                        style={styles.deleteBtn}
                                        title="Delete Category"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif"
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
    },
    titleGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    backBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#333'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1a1a1a',
        margin: 0
    },
    countBadge: {
        background: '#e0e0e0',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#555'
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    addSection: {
        background: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333'
    },
    form: {
        display: 'flex',
        gap: '12px'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '15px',
        outline: 'none'
    },
    addBtn: {
        background: '#1a1a1a',
        color: '#fff',
        border: 'none',
        padding: '0 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background 0.2s'
    },
    listSection: {
        background: '#fff',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #eee'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px'
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #eee',
        transition: 'all 0.2s'
    },
    catName: {
        fontWeight: '500',
        color: '#333'
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        color: '#999',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
};
