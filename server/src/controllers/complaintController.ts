import { Response } from 'express';
import mongoose from 'express';
import { Complaint, IComplaint, ComplaintStatus, PriorityLevel, WasteCategory } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';
import { getFileUrl } from '../middleware/upload.js';

const CATEGORY_NAMES: Record<string, string> = {
  plastic: 'Plastic & Synthetic Polymers',
  organic: 'Organic & Biodegradable Waste',
  paper_cardboard: 'Paper & Cardboard Packaging',
  metal: 'Metal & Scrap Cans',
  glass: 'Glass Bottles & Cullet',
  electronic: 'Electronic & E-Waste',
  hazardous: 'Hazardous & Bio-Medical Waste',
  mixed: 'Mixed Unsegregated Solid Waste',
};

// Generate human-friendly unique tracking ID
const generateTrackingId = (): string => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `SB-${year}-${randomDigits}`;
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const {
      title,
      description,
      wasteCategory,
      priority = 'Medium',
      latitude,
      longitude,
      address,
      landmark = '',
      ward = 'General Ward',
      city = 'Metropolis',
      aiAnalysis,
      imageUrl, // If uploaded via client or base64
    } = req.body;

    // Check file or url
    let beforeImageUrl = imageUrl;
    if (req.file) {
      beforeImageUrl = getFileUrl(req, req.file.filename);
    }

    if (!beforeImageUrl) {
      res.status(400).json({
        success: false,
        message: 'A photograph of the garbage is required.',
      });
      return;
    }

    if (!title || !description || !address || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, address, coordinates).',
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ success: false, message: 'Invalid latitude or longitude coordinates.' });
      return;
    }

    const categoryKey = (wasteCategory || 'mixed').toLowerCase() as WasteCategory;
    const trackingId = generateTrackingId();

    let parsedAiAnalysis = undefined;
    if (aiAnalysis) {
      try {
        parsedAiAnalysis = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
      } catch (e) {
        console.warn('Could not parse aiAnalysis JSON payload');
      }
    }

    const complaint = await Complaint.create({
      trackingId,
      citizen: req.user._id,
      citizenName: req.user.name,
      citizenEmail: req.user.email,
      citizenPhone: req.user.phone || '',
      title: title.trim(),
      description: description.trim(),
      wasteCategory: categoryKey,
      wasteCategoryName: CATEGORY_NAMES[categoryKey] || 'General Solid Waste',
      priority: priority as PriorityLevel,
      status: 'Submitted',
      location: {
        address: address.trim(),
        landmark: landmark.trim(),
        coordinates: { lat, lng },
        ward: ward.trim(),
        city: city.trim(),
      },
      beforeImage: {
        url: beforeImageUrl,
        uploadedAt: new Date(),
      },
      aiAnalysis: parsedAiAnalysis,
      timeline: [
        {
          status: 'Submitted',
          changedBy: req.user._id,
          changedByName: req.user.name,
          role: req.user.role,
          note: 'Complaint registered by citizen with geo-tagged photograph.',
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      trackingId: complaint.trackingId,
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { status, priority, category, ward, search, page = '1', limit = '50' } = req.query;
    const query: any = {};

    // Role-based scoping
    if (req.user.role === 'citizen') {
      query.citizen = req.user._id;
    } else if (req.user.role === 'worker') {
      // Workers see complaints assigned to them
      query.assignedWorker = req.user._id;
    }

    // Filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (category && category !== 'all') {
      query.wasteCategory = category;
    }
    if (ward && ward !== 'all') {
      query['location.ward'] = ward;
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { trackingId: searchRegex },
        { title: searchRegex },
        { 'location.address': searchRegex },
        { citizenName: searchRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('assignedWorker', 'name email phone avatar assignedZone employeeId')
        .populate('citizen', 'name email phone avatar'),
      Complaint.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      complaints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate('assignedWorker', 'name email phone avatar assignedZone employeeId')
      .populate('citizen', 'name email phone avatar');

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Role-based authorization
    if (
      req.user.role === 'citizen' &&
      complaint.citizen._id.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to view this complaint.' });
      return;
    }

    if (
      req.user.role === 'worker' &&
      complaint.assignedWorker?._id?.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden. This complaint is not assigned to you.' });
      return;
    }

    res.status(200).json({ success: true, complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintByTrackingId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { trackingId } = req.params;
    const complaint = await Complaint.findOne({ trackingId: trackingId.toUpperCase().trim() })
      .select('-citizenEmail -citizenPhone');

    if (!complaint) {
      res.status(404).json({ success: false, message: `No complaint found with tracking code '${trackingId}'.` });
      return;
    }

    res.status(200).json({ success: true, complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePriority = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const { id } = req.params;
    const { priority } = req.body;

    if (!['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
      res.status(400).json({ success: false, message: 'Invalid priority level.' });
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority as PriorityLevel;
    complaint.timeline.push({
      status: complaint.status,
      changedBy: req.user._id,
      changedByName: req.user.name,
      role: req.user.role,
      note: `Priority escalated/adjusted from ${oldPriority} to ${priority} by administrator.`,
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({ success: true, message: `Priority updated to ${priority}.`, complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      res.status(400).json({ success: false, message: 'Worker ID is required.' });
      return;
    }

    const [complaint, worker] = await Promise.all([
      Complaint.findById(id),
      User.findOne({ _id: workerId, role: 'worker', isActive: true }),
    ]);

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (!worker) {
      res.status(404).json({ success: false, message: 'Active sanitation worker not found.' });
      return;
    }

    complaint.assignedWorker = worker._id;
    complaint.assignedWorkerName = worker.name;
    complaint.assignedWorkerPhone = worker.phone || '';
    complaint.assignedAt = new Date();
    complaint.status = 'Assigned';
    complaint.recleaningRequested = false;

    complaint.timeline.push({
      status: 'Assigned',
      changedBy: req.user._id,
      changedByName: req.user.name,
      role: req.user.role,
      note: `Assigned to field sanitation worker ${worker.name} (${worker.assignedZone || 'Ward Zone'}).`,
      timestamp: new Date(),
    });

    await complaint.save();

    await AuditLog.create({
      action: 'ASSIGN_WORKER',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      targetId: complaint.trackingId,
      targetType: 'Complaint',
      details: { workerId: worker._id, workerName: worker.name },
    });

    res.status(200).json({
      success: true,
      message: `Assigned to worker ${worker.name} successfully.`,
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'worker') {
      res.status(403).json({ success: false, message: 'Sanitation worker privileges required.' });
      return;
    }

    const { id } = req.params;
    const { status, notes, imageUrl } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (complaint.assignedWorker?.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'This complaint is not assigned to your account.' });
      return;
    }

    // Handle transition to In Progress
    if (status === 'In Progress') {
      complaint.status = 'In Progress';
      complaint.timeline.push({
        status: 'In Progress',
        changedBy: req.user._id,
        changedByName: req.user.name,
        role: req.user.role,
        note: notes || 'Worker is on-site and initiating waste clearance.',
        timestamp: new Date(),
      });
      await complaint.save();
      res.status(200).json({ success: true, message: 'Status updated to In Progress.', complaint });
      return;
    }

    // Handle Cleaned / Awaiting Verification
    if (status === 'Cleaned_Pending_Verification') {
      let afterImageUrl = imageUrl;
      if (req.file) {
        afterImageUrl = getFileUrl(req, req.file.filename);
      }

      if (!afterImageUrl) {
        res.status(400).json({
          success: false,
          message: 'An after-cleaning photograph is required as visual evidence of clearance.',
        });
        return;
      }

      complaint.status = 'Cleaned_Pending_Verification';
      complaint.afterImage = {
        url: afterImageUrl,
        notes: notes || 'Site cleared and sanitized. Awaiting administrator review.',
        uploadedAt: new Date(),
      };
      complaint.timeline.push({
        status: 'Cleaned_Pending_Verification',
        changedBy: req.user._id,
        changedByName: req.user.name,
        role: req.user.role,
        note: `Clearance completed. After-cleaning photograph submitted for verification. Note: ${notes || 'Cleaned'}`,
        timestamp: new Date(),
      });

      await complaint.save();
      res.status(200).json({
        success: true,
        message: 'After-cleaning evidence submitted. Awaiting administrative verification.',
        complaint,
      });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid status transition requested.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const { id } = req.params;
    const { action, notes, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: "Action must be either 'approve' or 'reject'." });
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (action === 'approve') {
      complaint.status = 'Resolved';
      complaint.resolvedAt = new Date();
      complaint.recleaningRequested = false;
      complaint.timeline.push({
        status: 'Resolved',
        changedBy: req.user._id,
        changedByName: req.user.name,
        role: req.user.role,
        note: `Evidence verified and approved by administrator. Cleanliness verified. Note: ${notes || 'Approved'}`,
        timestamp: new Date(),
      });
    } else {
      // Reject: request re-cleaning
      complaint.status = 'In Progress';
      complaint.recleaningRequested = true;
      complaint.rejectionReason = rejectionReason || notes || 'Clearance quality unsatisfactory. Re-cleaning required.';
      complaint.timeline.push({
        status: 'In Progress',
        changedBy: req.user._id,
        changedByName: req.user.name,
        role: req.user.role,
        note: `Clearance evidence rejected: ${complaint.rejectionReason}. Re-cleaning requested from assigned worker.`,
        timestamp: new Date(),
      });
    }

    await complaint.save();

    await AuditLog.create({
      action: action === 'approve' ? 'VERIFY_APPROVE' : 'VERIFY_REJECT',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      targetId: complaint.trackingId,
      targetType: 'Complaint',
      details: { action, notes, rejectionReason },
    });

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Complaint approved and marked Resolved.' : 'Evidence rejected; re-cleaning requested.',
      complaint,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'citizen') {
      res.status(403).json({ success: false, message: 'Only citizens can submit feedback.' });
      return;
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (complaint.citizen.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'You can only rate your own complaints.' });
      return;
    }

    complaint.feedback = {
      rating: ratingNum,
      comment: comment || '',
      submittedAt: new Date(),
    };

    await complaint.save();

    res.status(200).json({ success: true, message: 'Feedback submitted successfully. Thank you!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
