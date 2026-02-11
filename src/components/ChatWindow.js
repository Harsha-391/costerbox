/* src/components/ChatWindow.js */
"use client";
import { useState, useEffect, useRef } from "react";
import { 
    collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, setDoc, getDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase"; 
import { useAuth } from "../context/AuthContext";
import { Send, Mic, Image as ImageIcon, ShieldAlert, XCircle } from "lucide-react"; 

export default function ChatWindow({ chatId, artisanId, productName, onClose }) {
    const { user, role } = useAuth();
    const [messages, setMessages] = useState([]);
    const [chatData, setChatData] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const mediaRecorderRef = useRef(null); 
    const messagesEndRef = useRef(null);

    // 1. Initialize Chat Room if it doesn't exist
    useEffect(() => {
        const initChat = async () => {
            if (!chatId || !user) return;
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                await setDoc(chatRef, {
                    productId: chatId.split('_').pop(), // Extract ID from "inquiry_uid_pid"
                    customerId: user.uid,
                    artisanId: artisanId || 'unassigned',
                    status: 'open',
                    hijackedBy: null,
                    lastUpdated: serverTimestamp()
                });
            }
        };
        initChat();
    }, [chatId, user, artisanId]);

    // 2. Listen to Chat & Messages
    useEffect(() => {
        if (!chatId) return;

        const unsubChat = onSnapshot(doc(db, "chats", chatId), (doc) => {
            setChatData(doc.data());
        });

        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
        const unsubMsg = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubChat(); unsubMsg(); };
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 3. Send Message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: newMessage,
            senderId: user.uid,
            type: "text",
            createdAt: serverTimestamp()
        });
        setNewMessage("");
    };

    // 4. Handle Media (Image)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileRef = ref(storage, `chat_media/${chatId}/${Date.now()}_img`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            await addDoc(collection(db, "chats", chatId, "messages"), {
                senderId: user.uid, type: "image", mediaUrl: url, createdAt: serverTimestamp()
            });
        } catch (err) { console.error(err); }
        setUploading(false);
    };

    // 5. Handle Audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
                const fileRef = ref(storage, `chat_media/${chatId}/${Date.now()}_audio`);
                await uploadBytes(fileRef, blob);
                const url = await getDownloadURL(fileRef);
                await addDoc(collection(db, "chats", chatId, "messages"), {
                    senderId: user.uid, type: "audio", mediaUrl: url, createdAt: serverTimestamp()
                });
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { alert("Microphone access denied"); }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    // 6. Admin Hijack
    const toggleHijack = async () => {
        if (role !== "admin") return;
        const newStatus = chatData?.hijackedBy ? null : user.uid;
        await updateDoc(doc(db, "chats", chatId), { hijackedBy: newStatus });
    };

    const canChat = () => {
        if (role === 'admin' || role === 'user') return true;
        if (role === 'artisan') return !chatData?.hijackedBy;
        return false;
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-lg bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{productName}</h3>
                    <span className="text-xs text-gray-400">Customization Request</span>
                </div>
                <div className="flex items-center gap-2">
                    {role === 'admin' && (
                        <button onClick={toggleHijack} className={`text-xs px-2 py-1 rounded ${chatData?.hijackedBy ? 'bg-red-500' : 'bg-gray-700'}`}>
                            {chatData?.hijackedBy ? "Release" : "Hijack"}
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.senderId === user.uid ? 'bg-black text-white' : 'bg-white border text-gray-800'}`}>
                            {msg.type === 'text' && <p>{msg.text}</p>}
                            {msg.type === 'image' && <img src={msg.mediaUrl} className="rounded-lg max-h-40" />}
                            {msg.type === 'audio' && <audio src={msg.mediaUrl} controls className="h-8 w-48" />}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
                {canChat() ? (
                    <form onSubmit={sendMessage} className="flex gap-2 items-center">
                        <label className="cursor-pointer text-gray-500 hover:text-black">
                            <ImageIcon size={20} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button type="button" onClick={isRecording ? stopRecording : startRecording} className={isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-black'}>
                            <Mic size={20} />
                        </button>
                        <input 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            placeholder={isRecording ? "Recording..." : "Type request..."}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <button type="submit" className="bg-black text-white p-2 rounded-full"><Send size={16} /></button>
                    </form>
                ) : (
                    <p className="text-center text-red-500 text-xs font-bold"> Chat locked by Admin</p>
                )}
            </div>
        </div>
    );
}