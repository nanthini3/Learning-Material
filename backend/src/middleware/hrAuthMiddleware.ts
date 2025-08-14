import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HrUser } from '../models/HrUserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

interface AuthenticatedHRRequest extends Request {
  user?: {
    hrId: string;
    email: string;
    type: string;
  };
}

export const authenticateHRToken = async (req: AuthenticatedHRRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      type: string;
    };

    if (decoded.type !== 'hr') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const hr = await HrUser.findById(decoded.userId);
    if (!hr) {
      return res.status(401).json({ message: 'HR user not found' });
    }

    req.user = {
      hrId: decoded.userId,
      email: decoded.email,
      type: decoded.type,
    };

    next();
  } catch (error) {
    console.error('HR token verification failed:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};
