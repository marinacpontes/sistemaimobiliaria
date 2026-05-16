import { Request, Response } from 'express';
import { LoginInput } from './auth.dto';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response) {
    const data = req.body as LoginInput;
    const result = await authService.login(data);
    res.json(result);
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    res.json({ user });
  },
};
