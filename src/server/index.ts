import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './authController';

const app = express();

// Basic CORS - enable everything for now to debug
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});

app.use('/api/auth', authRoutes);

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});