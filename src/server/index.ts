// src/server/index.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './controllers/authController.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8080', // Your client's URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Pre-flight requests
app.options('*', cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});