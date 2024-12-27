// src/client/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_URL = 'http://localhost:5000/api/auth';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name,
          role: 'user'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      navigate('/dashboard');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      navigate('/dashboard');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate('/auth');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;