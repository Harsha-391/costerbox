/* src/context/AuthContext.js */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // <--- Import Firestore tools
import { auth, db } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // <--- Store their Role (admin/artisan)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // 1. User is authenticated (Email/Pass matched)

                // 2. CHECK DATABASE FOR ROLE
                const userRef = doc(db, "users", firebaseUser.email); // We use Email as ID for simplicity
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setRole(userSnap.data().role); // 'admin' or 'artisan'
                } else {
                    setRole('guest'); // Valid login, but no role assigned
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                });
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        setUser(null);
        setRole(null);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};