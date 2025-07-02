// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Using useNavigate for redirection

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [user, setUser] = useState(null); // You might decode user from token later

    const navigate = useNavigate();

    // Effect to update isAuthenticated when token changes
    useEffect(() => {
        setIsAuthenticated(!!token);
        if (!token) {
            setUser(null);
        }
        // In a real app, you'd decode the token here to get user info
        // For simplicity, we're just checking token presence
    }, [token]);

    const login = (jwtToken) => {
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setIsAuthenticated(true);
        // Optionally decode user info here from the token and set `user` state
        navigate('/home'); // Redirect to home page after login
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);