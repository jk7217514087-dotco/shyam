import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'SmartBin AI — Municipal Solid Waste Management Core API',
    tagline: 'Report Smartly. Collect Efficiently. Keep Cities Clean.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  SmartBin AI Backend Server is live on port ${PORT}`);
      console.log(`  REST API URL: http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error: any) {
    console.error('Failed to start SmartBin AI Server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
