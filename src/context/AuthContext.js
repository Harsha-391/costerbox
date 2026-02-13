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

                // 0. HARDCODED SUPER ADMINS (For Development/Rescue)
                // Add your Google Account email here to force Admin access
                const SUPER_ADMIN_EMAILS = [
                    "sneeze.media@gmail.com",
                    "admin@costerbox.in"
                ];

                try {
                    // 1. Check Hardcoded List First
                    if (SUPER_ADMIN_EMAILS.includes(firebaseUser.email)) {
                        console.log("User authorized via Hardcoded List:", firebaseUser.email);
                        setRole('superadmin');
                    } else {
                        // 2. CHECK DATABASE FOR ROLE
                        const userRef = doc(db, "users", firebaseUser.email);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            setRole(userSnap.data().role); // 'admin', 'artisan', or 'user'
                        } else {
                            console.warn("User document not found. Defaulting to 'user' role.");
                            // Default to 'user' so they are logged in, just not admin
                            setRole('user');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole('user'); // Fallback to user on error
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
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