import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  getComplaintByTrackingId,
  updatePriority,
  assignWorker,
  updateWorkerStatus,
  verifyComplaint,
  submitFeedback,
} from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public complaint tracking lookup
router.get('/track/:trackingId', getComplaintByTrackingId);

// Protected routes
router.use(authenticate);

// Create new complaint (citizen)
router.post('/', upload.single('image'), createComplaint);

// List complaints (scoped by role)
router.get('/', getComplaints);

// Get single complaint
router.get('/:id', getComplaintById);

// Admin: Update priority
router.patch('/:id/priority', authorize('admin'), updatePriority);

// Admin: Assign worker
router.patch('/:id/assign', authorize('admin'), assignWorker);

// Worker: Update status & upload after-cleaning photo
router.patch('/:id/worker-status', authorize('worker'), upload.single('afterImage'), updateWorkerStatus);

// Admin: Verify completion (Approve / Reject)
router.patch('/:id/verify', authorize('admin'), verifyComplaint);

// Citizen: Feedback
router.post('/:id/feedback', authorize('citizen'), submitFeedback);

export default router;
