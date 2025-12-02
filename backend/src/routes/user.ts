import { Router, Request, Response } from 'express';
import { authRequired } from '../middleware/authRequired.js';
import { formatUserResponse } from '../services/authService.js';
import { IUser } from '../models/User.js';

const router = Router();

// GET /api/user/me
router.get('/me', authRequired, (req: Request, res: Response) => {
  const user = req.user as IUser;
  res.json(formatUserResponse(user));
});

export default router;

