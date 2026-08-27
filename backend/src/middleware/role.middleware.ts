// middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';

export const checkRoot = (req: Request, _res: Response, next: NextFunction): void => {
  if (!('role' in req.user) || (req.user as { role: string }).role !== 'ROOT')
    return next(new ForbiddenError('Acesso exclusivo do root'));
  next();
};

export const checkNotRoot = (req: Request, _res: Response, next: NextFunction): void => {
  if ('role' in req.user && (req.user as { role: string }).role === 'ROOT')
    return next(new ForbiddenError('Root não pode executar esta ação'));
  next();
};

export const checkCoordenador = (req: Request, _res: Response, next: NextFunction): void => {
  const user = req.user as { cargo?: string };
  if (user.cargo !== 'COORDENADOR')
    return next(new ForbiddenError('Acesso exclusivo de coordenadores'));
  next();
};
