// client/src/components/auth/RegisterForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from '../common/ErrorAlert';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await register({ username, email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-md mx-auto bg-base-100 shadow-md p-8 space-y-4">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      <div className="form-control">
        <label htmlFor="username" className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label htmlFor="email" className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label htmlFor="password" className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full mt-2" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;