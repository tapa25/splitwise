// frontend/src/components/GroupList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GroupList = () => {
    const { token, logout } = useAuth();
    const [groups, setGroups] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const config = {
                    headers: {
                        'x-auth-token': token
                    }
                };
                const res = await axios.get('https://splitwise-backend-vtqr.onrender.com//api/groups', config);
                setGroups(res.data);
            } catch (err) {
                console.error('Error fetching groups:', err.response ? err.response.data : err.message);
                setMessage('Failed to fetch groups.');
                setMessageType('error');
                if (err.response && err.response.status === 401) {
                    logout(); // Log out if token is invalid
                }
            }
        };

        if (token) {
            fetchGroups();
        }
    }, [token, logout]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!newGroupName.trim()) {
            setMessage('Group name cannot be empty.');
            setMessageType('error');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            const res = await axios.post('http://localhost:5000/api/groups', { name: newGroupName }, config);
            setGroups([...groups, res.data]);
            setNewGroupName('');
            setMessage('Group created successfully!');
            setMessageType('success');
        } catch (err) {
            console.error('Error creating group:', err.response ? err.response.data : err.message);
            setMessage('Failed to create group.');
            setMessageType('error');
        }
    };

    return (
        <div className="container">
            <h2>Your Groups</h2>

            <form onSubmit={handleCreateGroup} className="form-group">
                <input
                    type="text"
                    placeholder="New Group Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                />
                <button type="submit" className="btn">Create Group</button>
            </form>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            {groups.length === 0 ? (
                <p>No groups found. Create one above!</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {groups.map(group => (
                        <li key={group._id} style={{ marginBottom: '10px', backgroundColor: '#e9e9e9', padding: '10px', borderRadius: '4px' }}>
                            <Link to={`/groups/${group._id}`} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
                                {group.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={logout} className="btn" style={{marginTop: '20px'}}>Logout</button>
        </div>
    );
};

export default GroupList;
