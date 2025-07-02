// frontend/src/components/Home.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { logout } = useAuth();

    return (
        <div className="container">
            <h2>Welcome Home!</h2>
            <p>This is a protected route. You are logged in!</p>
            <button onClick={logout} className="btn">Logout</button>
        </div>
    );
};

export default Home;