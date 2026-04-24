import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            try {
                const savedUser = localStorage.getItem('user');
                let token = localStorage.getItem('token');

                if (savedUser && token) {
                    // টোকেন থেকে কোটেশন পরিষ্কার করা যাতে ব্যাকএন্ডে অথেন্টিকেশন ফেইল না করে
                    const cleanToken = token.replace(/['"]+/g, '').trim();
                    localStorage.setItem('token', cleanToken); // ক্লিন টোকেন আবার সেভ করে রাখা

                    setUser(JSON.parse(savedUser));
                }
            } catch (err) {
                console.error("Auth initialization error:", err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (userData, token) => {
        // সেভ করার আগেই টোকেন ক্লিন করে নেওয়া সবথেকে নিরাপদ
        const cleanToken = token.replace(/['"]+/g, '').trim();

        localStorage.setItem('token', cleanToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // রিডাইরেক্ট করার আগে স্টেট ক্লিন করা নিশ্চিত করা
        window.location.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};