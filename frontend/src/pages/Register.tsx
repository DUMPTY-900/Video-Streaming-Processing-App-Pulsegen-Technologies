import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('viewer');
    const [tenantId, setTenantId] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/register', {
                username,
                email,
                password,
                role,
                tenantId: tenantId || 'default-tenant'
            });
            login(data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
            console.error('Registration Error:', err);
        } finally {
            setLoading(false);
        }
    };
    // ... (skip down to button)
    <button
        type="submit"
        disabled={loading}
        className={`w-full text-white py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
        {loading ? 'Registering...' : 'Register'}
    </button>
                </form >
    <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
    </p>
            </div >
        </div >
    );
};

export default Register;
