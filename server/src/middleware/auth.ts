import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '../models/User';

export interface TokenPayload {
  sub: string; // the user's MongoDB _id
  role: Role;
}

// Teach TypeScript that req.auth exists after authentication
declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

/** Requires a valid "Authorization: Bearer <token>" header. */
export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    req.auth = jwt.verify(token, config.jwtSecret) as unknown as TokenPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
};

/** Use after requireAuth. Only lets Admins through. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.auth?.role !== 'Admin') {
    return res.status(403).json({ message: 'Only admins can do this.' });
  }
  next();
};
