/* src/app/secured/artisan/dashboard/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ArtisanDashboard() {
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else router.push('/secured/login');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Searching for "assignedArtisan" now
      const q = query(collection(db, "orders"), where("assignedArtisan", "==", currentUser.email));
      const unsub = onSnapshot(q, (snap) => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [currentUser]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status: status });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>Hello, Artist 🎨</h1>
        <p style={{ color: '#666' }}>You have <strong>{tasks.length}</strong> assigned projects.</p>
      </div>

      {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>No pending work today.</div>
      ) : (
          tasks.map(task => (
             <div key={task.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{task.item || "Custom Work"}</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>Status: <strong>{task.status}</strong></p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => updateStatus(task.id, 'In Progress')} style={{ flex: 1, padding: '10px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Start</button>
                    <button onClick={() => updateStatus(task.id, 'Done')} style={{ flex: 1, padding: '10px', background: '#e8f5e9', color: '#1b5e20', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Finish</button>
                </div>
             </div>
          ))
      )}
    </div>
  );
}