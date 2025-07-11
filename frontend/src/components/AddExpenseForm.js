// frontend/src/components/AddExpenseForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddExpenseForm = ({ groupId, groupMembers, onExpenseAdded }) => {
    const { token, user } = useAuth(); // Get current logged-in user
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        paidByUserId: user ? user.id : '' // Default paidBy to current user
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const { description, amount, paidByUserId } = formData;

    // Set initial paidByUserId if user is available
    React.useEffect(() => {
        if (user && !paidByUserId) {
            setFormData(prev => ({ ...prev, paidByUserId: user.id }));
        }
    }, [user, paidByUserId]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!description || !amount || !paidByUserId) {
            setMessage('Please fill in description, amount, and select who paid.');
            setMessageType('error');
            return;
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage('Amount must be a positive number.');
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
            const expenseData = {
                description,
                amount: parseFloat(amount), // Ensure amount is a number
                groupId,
                paidByUserId
            };

            const res = await axios.post('https://splitwise-backend-vtqr.onrender.com/api/expenses/add', expenseData, config);
            setMessage('Expense added successfully!');
            setMessageType('success');
            setFormData({
                description: '',
                amount: '',
                paidByUserId: user ? user.id : '' // Reset to current user or empty
            });
            onExpenseAdded(); // Callback to parent to re-fetch expenses

        } catch (err) {
            console.error('Error adding expense:', err.response ? err.response.data : err.message);
            const errorMessage = err.response && err.response.data && err.response.data.msg
                ? err.response.data.msg
                : 'Failed to add expense. Please try again.';
            setMessage(errorMessage);
            setMessageType('error');
        }
    };

    return (
        <form onSubmit={onSubmit} className="form-group" style={{border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={onChange}
                    min="0.01"
                    step="0.01"
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="paidByUserId">Paid By</label>
                <select
                    id="paidByUserId"
                    name="paidByUserId"
                    value={paidByUserId}
                    onChange={onChange}
                    required
                >
                    <option value="">Select a member</option>
                    {groupMembers.map(member => (
                        <option key={member._id} value={member._id}>
                            {member.username} {member._id === user?.id ? '(You)' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="btn">Add Expense</button>
            {message && (
                <div className={`message ${messageType}`} style={{marginTop: '15px'}}>
                    {message}
                </div>
            )}
        </form>
    );
};

export default AddExpenseForm;
