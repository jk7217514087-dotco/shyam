import { Router } from 'express';
import { classifyImage } from '../controllers/aiController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Endpoint for real-time AI image classification
router.post('/classify', upload.single('image'), classifyImage);

export default router;
