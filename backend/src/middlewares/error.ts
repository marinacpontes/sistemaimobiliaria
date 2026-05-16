import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../shared/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      issues: err.issues,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
      return res.status(409).json({ error: `Valor duplicado em: ${target}` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    return res.status(400).json({ error: `Erro de banco: ${err.code}` });
  }

  console.error('[errorHandler] erro não tratado:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}
