import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        name
      }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    // Create token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "User successfully created!",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (err) {
    const error = err as PostgrestError | Error;
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    const error = err as PostgrestError | Error;
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware for protected routes
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    const error = err as Error;
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Protected route example
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    const error = err as PostgrestError | Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;