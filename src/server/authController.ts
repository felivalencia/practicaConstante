// src/server/controllers/authController.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase/client.js';

// Add custom type for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const router = Router();

// Authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: Function
) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('jwt');
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Password validation function
const validatePassword = (password: string): boolean => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  return passwordRegex.test(password);
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in Supabase Auth
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('User creation failed');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          name,
          role
        }
      ]);

    if (profileError) throw profileError;

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Registration failed'
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Error logging in' 
    });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    res.clearCookie('jwt');
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.clearCookie('jwt');
    return res.status(200).json({ message: 'Logged out' });
  }
});

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: profile });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user data' });
  }
});

export default router;