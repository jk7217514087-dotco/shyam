import { Router } from 'express';
import { getWorkers, createWorker, toggleWorkerStatus } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/workers', getWorkers);
router.post('/workers', createWorker);
router.patch('/workers/:id/toggle', toggleWorkerStatus);

export default router;
