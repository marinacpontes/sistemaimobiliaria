import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { UnauthorizedError } from '../../shared/errors';
import { signToken } from '../../shared/jwt';
import { LoginInput } from './auth.dto';

export const authService = {
  async login({ email, senha }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Credenciais inválidas');

    const ok = await bcrypt.compare(senha, user.passwordHash);
    if (!ok) throw new UnauthorizedError('Credenciais inválidas');

    const token = signToken({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true },
    });
    if (!user) throw new UnauthorizedError();
    return user;
  },
};
