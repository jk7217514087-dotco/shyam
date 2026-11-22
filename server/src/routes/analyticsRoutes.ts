import { Router } from 'express';
import { getSystemAnalytics } from '../controllers/analyticsController.js';

const router = Router();

// Public / system analytics for landing page and admin dashboard
router.get('/', getSystemAnalytics);

export default router;
