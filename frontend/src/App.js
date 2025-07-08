// frontend/src/App.js
// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home'; // This can be removed or repurposed
import GroupList from './components/GroupList'; // New: Import GroupList
import GroupDetail from './components/GroupDetail'; // New: Import GroupDetail
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// A wrapper for <Route> that redirects to the login screen if you're not yet authenticated.
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // Use the AuthContext's isAuthenticated status
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <AuthProvider> {/* Wrap your entire app with AuthProvider */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* Protected Routes */}
                    <Route
                        path="/groups"
                        element={
                            <PrivateRoute>
                                <GroupList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/groups/:groupId"
                        element={
                            <PrivateRoute>
                                <GroupDetail />
                            </PrivateRoute>
                        }
                    />
                    {/* Redirect from root to groups if authenticated, or login if not */}
                    <Route
                        path="/"
                        element={
                            <AuthRedirect />
                        }
                    />
                    {/* Optional: if you still want a 'Home' page, protect it */}
                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                <Home /> {/* Keep your old Home component or remove */}
                            </PrivateRoute>
                        }
                    />
                    {/* Catch-all for undefined routes, redirects to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

// Helper component to redirect based on auth status at root
const AuthRedirect = () => {
    const { isAuthenticated } = useAuth();
    // Check if token is valid or expired using the `updateAuthStatus` (implicitly in AuthProvider)
    return isAuthenticated ? <Navigate to="/groups" replace /> : <Navigate to="/login" replace />;
};

export default App;
