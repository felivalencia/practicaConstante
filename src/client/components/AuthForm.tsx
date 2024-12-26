// src/client/components/AuthForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'forgotPassword';

interface AuthState {
  email: string;
  password: string;
  name?: string;
}

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [formState, setFormState] = useState<AuthState>({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        await login(formState.email, formState.password);
      } else if (mode === 'register') {
        await register(formState.email, formState.password, formState.name || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form">
          <div className="auth-header">
            <h1>
              {mode === 'login' ? 'Welcome Back' : 
               mode === 'register' ? 'Create Account' : 
               'Reset Password'}
            </h1>
            <p>
              {mode === 'login' ? "Don't have an account? " : 
               mode === 'register' ? 'Already have an account? ' :
               'Remember your password? '}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form-group">
            {mode === 'register' && (
              <div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formState.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgotPassword' && (
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formState.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 
               mode === 'register' ? 'Create account' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;