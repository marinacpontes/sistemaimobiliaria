import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { UnauthorizedError } from '../shared/errors';
import { verifyToken } from '../shared/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token não enviado');
    }
    const token = header.slice('Bearer '.length).trim();
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedError('Sessão inválida. Faça login novamente.');
    }

    req.user = { id: user.id };
    next();
  } catch (err) {
    next(err);
  }
}
