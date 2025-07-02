// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css'; // Import the basic styling

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <AuthProvider> {/* Wrap your entire app with AuthProvider */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        }
                    />
                    {/* Redirect from root to login if not authenticated, or home if authenticated */}
                    <Route
                        path="/"
                        element={
                            <AuthRedirect />
                        }
                    />
                    <Route path="*" element={<Navigate to="/login" replace />} /> {/* Catch-all for undefined routes */}
                </Routes>
            </AuthProvider>
        </Router>
    );
}

// Helper component to redirect based on auth status at root
const AuthRedirect = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};


export default App;
