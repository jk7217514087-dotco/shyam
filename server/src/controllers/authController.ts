import { Request, Response } from 'express';
import { User, IUser, UserRole } from '../models/User.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // Role safety: Public registration is always 'citizen'
    // Workers and admins can only be created by an authenticated administrator
    const assignedRole: UserRole = 'citizen';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: assignedRole,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact municipal support.',
      });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        assignedZone: user.assignedZone,
        employeeId: user.employeeId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar: req.user.avatar,
        department: req.user.department,
        assignedZone: req.user.assignedZone,
        employeeId: req.user.employeeId,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, phone, avatar } = req.body;
    // Security check: NEVER allow updating role or email through generic profile update!
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (avatar) req.user.avatar = avatar;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar: req.user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDemoAccounts = async (_req: Request, res: Response): Promise<void> => {
  // Safe endpoint for quick-login convenience during hackathon demonstration
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: 'admin',
        title: 'Municipal Administrator',
        email: 'admin@smartbin.ai',
        password: 'Admin@123',
        description: 'Full supervisory authority, worker dispatch, triage & verification',
      },
      {
        role: 'worker',
        title: 'Sanitation Worker',
        email: 'worker.rajesh@smartbin.ai',
        password: 'Worker@123',
        description: 'Field cleaning tasks, geo-navigation, after-photo upload',
      },
      {
        role: 'citizen',
        title: 'Active Citizen',
        email: 'citizen.ananya@gmail.com',
        password: 'Citizen@123',
        description: 'Waste complaint reporting, AI photo analysis, real-time tracking',
      },
    ],
  });
};
