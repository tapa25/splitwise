// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false
    const [user, setUser] = useState(null); // Stores decoded user info

    const navigate = useNavigate();

    // Function to decode token and set user/auth status
    const updateAuthStatus = useCallback((jwtToken) => {
        if (jwtToken) {
            try {
                const decoded = jwtDecode(jwtToken);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    // Token expired
                    localStorage.removeItem('token');
                    setToken(null);
                    setIsAuthenticated(false);
                    setUser(null);
                    console.log('Token expired, logged out.');
                    return false; // Indicate token was invalid/expired
                }
                setToken(jwtToken);
                setIsAuthenticated(true);
                setUser(decoded.user); // Store the user object from the token payload
                return true; // Indicate token was valid
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
                setToken(null);
                setIsAuthenticated(false);
                setUser(null);
                return false; // Indicate token was invalid
            }
        } else {
            localStorage.removeItem('token');
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
            return false; // Indicate no token
        }
    }, []);

    // Effect to run once on component mount to check initial token
    useEffect(() => {
        updateAuthStatus(localStorage.getItem('token'));
    }, [updateAuthStatus]);

    const login = (jwtToken) => {
        localStorage.setItem('token', jwtToken);
        if (updateAuthStatus(jwtToken)) { // Only navigate if token is valid
            navigate('/groups'); // Redirect to groups page after login
        }
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