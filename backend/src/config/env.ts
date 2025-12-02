import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-app',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  
  // OpenWeatherMap (trim to remove accidental whitespace)
  openWeatherMapApiKey: (process.env.OPENWEATHERMAP_API_KEY || '').trim(),
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  
  // Frontend
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  
  // Cache TTL (milliseconds)
  cacheTtlCurrent: parseInt(process.env.CACHE_TTL_CURRENT || '300000', 10), // 5 minutes
  cacheTtlForecast: parseInt(process.env.CACHE_TTL_FORECAST || '1800000', 10), // 30 minutes
};

