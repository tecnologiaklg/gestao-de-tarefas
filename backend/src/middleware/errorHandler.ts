// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean; code?: string; errors?: unknown[] },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err.isOperational && err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err.name === 'ZodError') {
    res.status(422).json({ error: 'Dados inválidos', details: err.errors });
    return;
  }
  if (err.code === '23505') {
    res.status(409).json({ error: 'Registro já existe' });
    return;
  }
  console.error('[errorHandler]', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
};
