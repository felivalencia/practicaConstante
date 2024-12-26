// src/server/controllers/authController.ts
import { Router, Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase/client';
import { User } from '@supabase/supabase-js';

const router = Router();

// Add custom type for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Authentication middleware
export const authenticateToken = (req: AuthenticatedRequest, res: any, next: any) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('jwt');
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: hashedPassword,
      options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { 
        id: data.user.id, 
        email: data.user.email,
        name 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
});

// Protected route example
router.get('/protected', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ message: 'You have access to this protected route', user: req.user });
});

export default router;