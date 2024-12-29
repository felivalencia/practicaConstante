// src/server/authController.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from './supabase/client';

const router = Router();

// Simple register endpoint
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  console.log('Register attempt:', { email, name });

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user directly
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name }])
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Simple login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.hash(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;