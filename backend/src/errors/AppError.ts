// errors/AppError.ts

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError     extends AppError { constructor(m = 'Requisição inválida')       { super(m, 400); } }
export class UnauthorizedError   extends AppError { constructor(m = 'Não autorizado')              { super(m, 401); } }
export class ForbiddenError      extends AppError { constructor(m = 'Acesso negado')               { super(m, 403); } }
export class NotFoundError       extends AppError { constructor(m = 'Recurso não encontrado')      { super(m, 404); } }
export class ConflictError       extends AppError { constructor(m = 'Conflito')                    { super(m, 409); } }
export class UnprocessableError  extends AppError { constructor(m = 'Dados inválidos')             { super(m, 422); } }
