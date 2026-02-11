/* src/app/secured/superadmin/manage-artisans/page.js */
"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase'; 
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function ArtisanChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");

  // 1. Fetch All Active Chats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chats"), (snapshot) => {
        const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChats(chatsData);
        if (chatsData.length > 0 && !selectedChatId) {
            setSelectedChatId(chatsData[0].id); // Auto select first chat
        }
    });
    return () => unsub();
  }, []);

  // 2. Identify the currently selected chat object
  const activeChat = chats.find(c => c.id === selectedChatId);

  // 3. Admin Intervention (Send Message)
  const sendIntervention = async () => {
    if (!adminMessage.trim()) return;
    const chatRef = doc(db, "chats", selectedChatId);
    
    await updateDoc(chatRef, {
        messages: arrayUnion({
            sender: 'admin',
            text: `[ADMIN ALERT]: ${adminMessage}`,
            time: new Date().toLocaleTimeString()
        })
    });
    setAdminMessage("");
  };

  return (
    <div style={{ display: 'flex', height: '85vh', gap: '20px' }}>
      
      {/* LEFT: List of Chats */}
      <div style={{ width: '300px', background: '#fff', overflowY: 'auto' }}>
         <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>Active Negotiations</div>
         {chats.map(chat => (
             <div 
                key={chat.id} 
                onClick={() => setSelectedChatId(chat.id)}
                style={{ 
                    padding: '15px', 
                    borderBottom: '1px solid #f5f5f5', 
                    background: selectedChatId === chat.id ? '#e3f2fd' : 'transparent',
                    cursor: 'pointer' 
                }}
             >
                 <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Order: {chat.id}</div>
                 <div style={{ fontSize: '12px', color: '#666' }}>Last msg: {chat.messages ? chat.messages[chat.messages.length - 1]?.text.substring(0, 20) : "No msgs"}...</div>
             </div>
         ))}
      </div>

      {/* RIGHT: Chat Window */}
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
            <>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fafafa' }}>
                    {activeChat.messages && activeChat.messages.map((msg, i) => (
                        <div key={i} style={{ 
                            display: 'flex', 
                            justifyContent: msg.sender === 'customer' ? 'flex-start' : (msg.sender === 'admin' ? 'center' : 'flex-end'),
                            marginBottom: '10px' 
                        }}>
                            <div style={{ 
                                padding: '10px 15px', 
                                borderRadius: '10px', 
                                background: msg.sender === 'customer' ? '#fff' : (msg.sender === 'admin' ? '#ffebee' : '#333'),
                                color: msg.sender === 'customer' ? '#000' : (msg.sender === 'admin' ? '#c62828' : '#fff'),
                                border: msg.sender === 'customer' ? '1px solid #ddd' : 'none',
                                maxWidth: '70%',
                                fontSize: '14px'
                            }}>
                                {msg.sender === 'admin' && <strong>👮 SUPERVISOR: </strong>}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Intervention Box */}
                <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                    <input 
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        placeholder="Type an intervention message..." 
                        style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <button onClick={sendIntervention} style={{ padding: '10px 20px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Send
                    </button>
                </div>
            </>
        ) : (
            <div style={{ padding: '20px' }}>Select a chat to monitor</div>
        )}
      </div>

    </div>
  );
}