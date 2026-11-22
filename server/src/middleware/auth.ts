import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'smartbin_ai_super_secure_jwt_secret_2026';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed. User account no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Contact municipal administrator.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required for this resource.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to perform this action. Required: [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
