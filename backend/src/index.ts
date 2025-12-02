import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import passport from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import weatherRoutes from './routes/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Connect to database
  await connectDatabase();

  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: env.isProduction ? undefined : false,
  }));

  // CORS
  app.use(cors({
    origin: env.frontendOrigin,
    credentials: true,
  }));

  // Request logging
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongodbUri,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      secure: env.isProduction,
      httpOnly: true,
      sameSite: env.isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Rate limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Weather-specific rate limiter (stricter)
  const weatherLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 60, // 60 requests per window
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use('/api/user', apiLimiter, userRoutes);
  app.use('/api/weather', weatherLimiter, weatherRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve frontend in production
  if (env.isProduction) {
    // Use configured path or default relative path
    const frontendPath = env.frontendDistPath 
      ? path.resolve(env.frontendDistPath)
      : path.resolve(__dirname, '../frontend/dist');
    
    logger.info(`Serving frontend from: ${frontendPath}`);
    app.use(express.static(frontendPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Error handler (must be last)
  app.use(errorHandler);

  // Start server
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
    logger.info(`Frontend origin: ${env.frontendOrigin}`);
    logger.info(`Environment: ${env.nodeEnv}`);
  });
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

