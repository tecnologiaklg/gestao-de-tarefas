import { Request, Response, NextFunction } from 'express';

// Cores ANSI para o terminal
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
};

function getStatusColor(status: number): string {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Ignora healthcheck para não poluir o terminal
  if (req.path === '/health') {
    return next();
  }

  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);
    const methodColor = req.method === 'GET' ? colors.blue : req.method === 'POST' ? colors.green : req.method === 'DELETE' ? colors.red : colors.yellow;

    const user = (req as Request & { user?: { nome?: string; cargo?: string; is_root?: boolean } }).user;
    const userInfo = user ? `${colors.dim}[${user.is_root ? 'Root' : user.nome}]${colors.reset} ` : '';

    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${methodColor}${req.method.padEnd(6)}${colors.reset} ${req.originalUrl} ${statusColor}${res.statusCode}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset} ${userInfo}`
    );
  });

  next();
}
