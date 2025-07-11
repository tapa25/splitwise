// frontend/src/components/GroupDetail.js
import React, { useState, useEffect, useCallback } from 'react'; // Ensure useCallback is imported
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddExpenseForm from './AddExpenseForm';

const GroupDetail = () => {
    const { groupId } = useParams();
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Wrap fetchGroupData in useCallback
    const fetchGroupData = useCallback(async () => {
        setLoading(true);
        setMessage('');
        setMessageType('');
        try {
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            const groupRes = await axios.get(`https://splitwise-backend-vtqr.onrender.com/groups/${groupId}`, config);
            setGroup(groupRes.data);

            const expensesRes = await axios.get(`https://splitwise-backend-vtqr.onrender.com/api/expenses/group/${groupId}`, config);
            setExpenses(expensesRes.data);

        } catch (err) {
            console.error('Error fetching group data:', err.response ? err.response.data : err.message);
            const errMsg = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Failed to load group details or expenses.';
            setMessage(errMsg);
            setMessageType('error');

            if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
                setTimeout(() => {
                    if (err.response.status === 401) {
                        logout();
                    } else {
                        navigate('/groups');
                    }
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [groupId, token, logout, navigate]); // Dependencies for useCallback: If any of these change, fetchGroupData will be re-created.

    // useEffect hook to call fetchGroupData
    useEffect(() => {
        if (token && groupId) {
            fetchGroupData();
        }
    }, [token, groupId, fetchGroupData]); // Now fetchGroupData is a stable dependency thanks to useCallback

    // Callback to refresh expenses after a new one is added
    // Wrap onExpenseAdded in useCallback as well, since it uses fetchGroupData
    const onExpenseAdded = useCallback(() => {
        fetchGroupData();
    }, [fetchGroupData]); // Dependency for onExpenseAdded

    if (loading) {
        return <div className="container">Loading group data...</div>;
    }

    if (!group) {
        return (
            <div className="container">
                <p>Could not load group details.</p>
                {message && <div className={`message ${messageType}`}>{message}</div>}
                <p className="link-text"><Link to="/groups">Back to Groups</Link></p>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Group: {group.name}</h2>
            <p className="link-text"><Link to="/groups">Back to Groups</Link></p>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <h3>Members:</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', textAlign: 'left' }}>
                {group.members.map(member => (
                    <li key={member._id}>{member.username} ({member.email})</li>
                ))}
            </ul>

            <h3>Add New Expense</h3>
            <AddExpenseForm groupId={groupId} groupMembers={group.members} onExpenseAdded={onExpenseAdded} />

            <h3>Expenses:</h3>
            {expenses.length === 0 ? (
                <p>No expenses added yet.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {expenses.map(expense => (
                        <li key={expense._id} style={{ marginBottom: '10px', backgroundColor: '#e0f7fa', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>
                            <strong>Description:</strong> {expense.description}<br />
                            <strong>Amount:</strong> ₹{expense.amount.toFixed(2)}<br />
                            <strong>Paid By:</strong> {expense.paidBy.username}<br />
                            <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupDetail;
