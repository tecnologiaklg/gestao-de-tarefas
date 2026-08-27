// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UnauthorizedError } from '../errors/AppError';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next(new UnauthorizedError('Token não fornecido'));
  const token = authHeader.split(' ')[1];
  try {
    req.user = AuthService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
};
