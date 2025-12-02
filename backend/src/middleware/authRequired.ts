import { Request, Response, NextFunction } from 'express';

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // For API requests, return 401 JSON
  res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
}

