import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

import authRoutes from '../routes/authRoutes.js';
import complaintRoutes from '../routes/complaintRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';
import { seedDatabase } from '../seed/seedData.js';

import { connectDB, disconnectDB } from '../config/db.js';

let app: express.Express;

beforeAll(async () => {
  await connectDB();

  app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/analytics', analyticsRoutes);

  await seedDatabase();
});

afterAll(async () => {
  await disconnectDB();
});



describe('SmartBin AI Backend API Suite', () => {
  it('GET /api/health should return 200 healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/auth/demo-accounts returns seeded accounts', async () => {
    const res = await request(app).get('/api/auth/demo-accounts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accounts.length).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/auth/login validates credentials', async () => {
    // Valid citizen login
    const validRes = await request(app).post('/api/auth/login').send({
      email: 'citizen.ananya@gmail.com',
      password: 'Citizen@123',
    });
    expect(validRes.status).toBe(200);
    expect(validRes.body.token).toBeDefined();
    expect(validRes.body.user.role).toBe('citizen');

    // Invalid credentials
    const invalidRes = await request(app).post('/api/auth/login').send({
      email: 'citizen.ananya@gmail.com',
      password: 'WrongPassword',
    });
    expect(invalidRes.status).toBe(401);
  });

  it('GET /api/users/workers strictly enforces admin role permission', async () => {
    // 1. Unauthenticated request
    const unauthRes = await request(app).get('/api/users/workers');
    expect(unauthRes.status).toBe(401);

    // 2. Citizen attempt (must receive 403 Forbidden)
    const citizenLogin = await request(app).post('/api/auth/login').send({
      email: 'citizen.ananya@gmail.com',
      password: 'Citizen@123',
    });
    const citizenToken = citizenLogin.body.token;

    const forbiddenRes = await request(app)
      .get('/api/users/workers')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(forbiddenRes.status).toBe(403);

    // 3. Admin attempt (must succeed 200)
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@smartbin.ai',
      password: 'Admin@123',
    });
    const adminToken = adminLogin.body.token;

    const adminRes = await request(app)
      .get('/api/users/workers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.workers.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/complaints/track/:trackingId returns complaint data publicly', async () => {
    const res = await request(app).get('/api/complaints/track/SB-2026-10482');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.trackingId).toBe('SB-2026-10482');
  });

  it('GET /api/analytics returns real aggregated statistics', async () => {
    const res = await request(app).get('/api/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics.totalComplaints).toBeGreaterThan(0);
    expect(res.body.metrics.impact.wasteCollectedKg).toBeDefined();
  });
});
