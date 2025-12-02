import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { registerUser, formatUserResponse } from '../services/authService.js';
import { createError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { IUser } from '../models/User.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerSchema.parse(req.body);
    
    const user = await registerUser(input);
    
    // Auto-login after registration
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({ user: formatUserResponse(user) });
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
  } catch (error) {
    return next(error);
  }
  
  passport.authenticate('local', (err: Error | null, user: IUser | false, info: { message: string }) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(createError(info?.message || 'Invalid credentials', 401));
    }
    
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ user: formatUserResponse(user) });
    });
  })(req, res, next);
});

// POST /auth/logout
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Google OAuth routes (only if configured)
if (env.googleClientId && env.googleClientSecret) {
  // GET /auth/google
  router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
  
  // GET /auth/google/callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${env.frontendOrigin}/login?error=google_auth_failed` }),
    (req: Request, res: Response) => {
      // Successful authentication, redirect to frontend dashboard
      res.redirect(`${env.frontendOrigin}/dashboard`);
    }
  );
}

// GET /auth/google/status - Check if Google OAuth is available
router.get('/google/status', (req: Request, res: Response) => {
  res.json({ 
    available: !!(env.googleClientId && env.googleClientSecret) 
  });
});

export default router;

