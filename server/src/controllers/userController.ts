import { Response } from 'express';
import { User, IUser } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { AuthRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

export const getWorkers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });

    // Attach current active assignments count and total resolved count for each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
        const [activeCount, resolvedCount] = await Promise.all([
          Complaint.countDocuments({
            assignedWorker: worker._id,
            status: { $in: ['Assigned', 'In Progress', 'Cleaned_Pending_Verification'] },
          }),
          Complaint.countDocuments({
            assignedWorker: worker._id,
            status: 'Resolved',
          }),
        ]);

        return {
          ...worker.toObject(),
          activeTasks: activeCount,
          resolvedTasks: resolvedCount,
        };
      })
    );

    res.status(200).json({ success: true, count: workers.length, workers: workersWithStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const { name, email, password, phone, assignedZone, department } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const randomEmpNum = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `SBW-${randomEmpNum}`;

    const worker = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'worker',
      phone: phone || '',
      assignedZone: assignedZone || 'Central Zone',
      department: department || 'Municipal Solid Waste Operations',
      employeeId,
      isActive: true,
    });

    await AuditLog.create({
      action: 'CREATE_WORKER',
      performedBy: req.user._id,
      performedByName: req.user.name,
      role: req.user.role,
      targetId: worker._id.toString(),
      targetType: 'User',
      details: { name: worker.name, email: worker.email, employeeId },
    });

    res.status(201).json({
      success: true,
      message: `Sanitation worker account '${worker.name}' created successfully.`,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        role: worker.role,
        phone: worker.phone,
        assignedZone: worker.assignedZone,
        employeeId: worker.employeeId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleWorkerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Administrator privileges required.' });
      return;
    }

    const { id } = req.params;
    const worker = await User.findOne({ _id: id, role: 'worker' });

    if (!worker) {
      res.status(404).json({ success: false, message: 'Worker not found.' });
      return;
    }

    worker.isActive = !worker.isActive;
    await worker.save();

    res.status(200).json({
      success: true,
      message: `Worker account has been ${worker.isActive ? 'activated' : 'deactivated'}.`,
      isActive: worker.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
