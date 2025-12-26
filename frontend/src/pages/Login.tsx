import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };
    // ...
    <button
        type="submit"
        disabled={loading}
        className={`w-full text-white py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
        {loading ? 'Logging in...' : 'Login'}
    </button>
                </form >
    <p className="mt-4 text-center">
        Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
    </p>
            </div >
        </div >
    );
};

export default Login;
