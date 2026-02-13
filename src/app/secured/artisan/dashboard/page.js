/* src/app/secured/artisan/dashboard/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { MapPin, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ChatWindow from '../../../../components/ChatWindow';

const ZONES = ["North India", "South India", "East India", "West India", "Central India"];

export default function ArtisanDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [artisanProfile, setArtisanProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // TABS: 'requests' (Uber feed) or 'active' (My work)
  const [activeTab, setActiveTab] = useState('requests');

  // DATA
  const [feedOrders, setFeedOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // CHAT
  const [chatOrder, setChatOrder] = useState(null);

  const router = useRouter();

  useEffect(() => {
    console.log("Artisan Dashboard V2 Loaded");
  }, []);

  // 1. AUTH & PROFILE SETUP
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch Artisan Profile (for Zone)
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setArtisanProfile(userSnap.data());
        } else {
          // Create basic profile if missing (unlikely for artisan)
          await setDoc(userRef, { email: user.email, role: 'artisan' }, { merge: true });
          setArtisanProfile({ email: user.email, role: 'artisan' });
        }
      } else {
        router.push('/secured/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. FETCH ORDERS (Realtime Listeners)
  useEffect(() => {
    if (!currentUser || !artisanProfile?.zone) return;

    // A. "UBER FEED": Pending Custom Orders
    // We filter all 'pending_artisan_acceptance' orders. 
    // Ideally, we would filter by Zone here, but for now we fetch all and rely on the artisan to select based on Region.
    const qFeed = query(
      collection(db, "orders"),
      where("status", "==", "pending_artisan_acceptance")
    );

    const unsubFeed = onSnapshot(qFeed, (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFeedOrders(orders);
    });

    // B. MY ACTIVE ORDERS
    // status != 'pending...' AND artisanId == currentUser.uid
    const qMyWork = query(
      collection(db, "orders"),
      where("artisanId", "==", currentUser.uid)
    );

    const unsubMyWork = onSnapshot(qMyWork, (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by date desc
      orders.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setMyOrders(orders);
    });

    return () => { unsubFeed(); unsubMyWork(); };
  }, [currentUser, artisanProfile]);

  // ACTION: UPDATE ZONE
  const handleZoneSelect = async (zone) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.email), { zone: zone });
    setArtisanProfile(prev => ({ ...prev, zone: zone }));
    alert(`Zone set to ${zone}! You will now receive orders from this region.`);
  };

  // ACTION: ACCEPT ORDER
  const acceptOrder = async (order) => {
    if (!currentUser) return;

    const confirmed = window.confirm(`Accept order for ${order.product?.name}? You are committing to fulfill this custom request.`);
    if (!confirmed) return;

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: 'accepted_by_artisan',
        artisanId: currentUser.uid,
        artisanEmail: currentUser.email,
        artisanName: artisanProfile.name || "Artisan",
        acceptedAt: new Date()
      });
      alert("Order Accepted! It is now in your 'Active Orders' tab.");
      setActiveTab('active');
    } catch (err) {
      console.error(err);
      alert("Failed to accept order. It may have been taken by another artisan.");
    }
  };

  // ACTION: FLAG ORDER
  const flagOrder = async (orderId) => {
    const reason = prompt("Why are you flagging this order? (e.g. Can't understand req, Out of stock)");
    if (!reason) return;

    await updateDoc(doc(db, "orders", orderId), {
      isFlagged: true,
      flagReason: reason,
      status: 'flagged_by_artisan'
    });
    alert("Order flagged. Superadmin has been notified.");
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Dashboard...</div>;

  // --- ZONE SELECTION SCREEN ---
  if (!artisanProfile?.zone) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <MapPin size={48} color="#e65100" style={{ marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '10px' }}>Select Your Zone</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>To match you with nearby customers, please select your operating region in India.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ZONES.map(zone => (
            <button
              key={zone}
              onClick={() => handleZoneSelect(zone)}
              style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontSize: '16px', fontWeight: '500', transition: 'all 0.2s' }}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Artisan Dashboard</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Zone: <strong>{artisanProfile.zone}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#888' }}>Logged in as</span>
          <strong>{artisanProfile.name || currentUser.email}</strong>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: '#fff', borderRadius: '8px', padding: '4px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'requests' ? '#1a1a1a' : 'transparent', color: activeTab === 'requests' ? '#fff' : '#555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          New Requests ({feedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'active' ? '#1a1a1a' : 'transparent', color: activeTab === 'active' ? '#fff' : '#555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          My Active Orders ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'profile' ? '#1a1a1a' : 'transparent', color: activeTab === 'profile' ? '#fff' : '#555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Pickup Profile
        </button>
      </div>

      {/* CONTENT: UBER FEED */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {feedOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No new requests in your zone right now.</p>
            </div>
          ) : (
            feedOrders.map(order => (
              <div key={order.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{order.product?.name}</h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>
                      Region: {order.product?.region || 'Unknown'} •
                      <span style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: '5px' }}>
                        Partial Paid: ₹{order.payment?.paidAmount}
                      </span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      New Request
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={order.product?.image} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#333' }}><strong>Customer:</strong> {order.shipping?.firstName} ({order.shipping?.city})</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Requires customization. 70% advance received.</div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => acceptOrder(order)}
                    style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <CheckCircle size={20} /> Accept Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENT: ACTIVE ORDERS */}
      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>No active orders. Accept requests to start working.</p>
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{order.product?.name}</h3>
                  <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setChatOrder(order)}
                    style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <MessageCircle size={18} /> Chat with Customer
                  </button>
                  <button
                    onClick={() => flagOrder(order.id)}
                    style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    title="Flag Issue"
                  >
                    <AlertTriangle size={18} />
                  </button>
                </div>

                {/* Order Details */}
                <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Shipping To:</strong> {order.shipping?.address}, {order.shipping?.city}</p>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Phone:</strong> {order.shipping?.phone}</p>
                  <hr style={{ margin: '10px 0', borderColor: '#e5e7eb' }} />
                  <p style={{ margin: 0, color: '#6b7280', fontStyle: 'italic' }}>
                    "Please prepare this item as per standard customization. Use chat for specific details."
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENT: PROFILE / PICKUP ADDRESS */}
      {activeTab === 'profile' && (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Pickup Address Details</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
            This address will be used by our courier partners (Shiprocket) to pick up finished orders. Please ensure it is accurate.
          </p>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const pickupAddress = {
              name: formData.get('name'),
              line1: formData.get('line1'),
              city: formData.get('city'),
              state: formData.get('state'),
              pincode: formData.get('pincode'),
              phone: formData.get('phone')
            };

            try {
              await updateDoc(doc(db, "users", currentUser.email), { pickupAddress });
              setArtisanProfile(prev => ({ ...prev, pickupAddress }));
              alert("Pickup Address Updated!");
            } catch (err) {
              console.error(err);
              alert("Failed to update address.");
            }
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contact Name</label>
              <input name="name" defaultValue={artisanProfile?.name || artisanProfile?.pickupAddress?.name} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address Line 1 (House No, Street)</label>
              <input name="line1" defaultValue={artisanProfile?.pickupAddress?.line1} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>City</label>
                <input name="city" defaultValue={artisanProfile?.pickupAddress?.city} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>State</label>
                <input name="state" defaultValue={artisanProfile?.pickupAddress?.state} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Pincode</label>
                <input name="pincode" defaultValue={artisanProfile?.pickupAddress?.pincode} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Pickup Contact Phone</label>
                <input name="phone" defaultValue={artisanProfile?.pickupAddress?.phone} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <button type="submit" style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save Details
            </button>
          </form>
        </div>
      )}

      {/* CHAT MODAL */}
      {chatOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '10px' }}>
          <ChatWindow
            chatId={`order_${chatOrder.id}`}
            artisanId={currentUser.uid}
            customerId={chatOrder.userId}
            productName={chatOrder.product?.name}
            onClose={() => setChatOrder(null)}
            isArtisanView={true}
          />
        </div>
      )}

    </div>
  );
}