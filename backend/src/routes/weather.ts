import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authRequired } from '../middleware/authRequired.js';
import { getWeather, WeatherQuery } from '../services/weatherService.js';

const router = Router();

// Validation schema for weather query
const weatherQuerySchema = z.object({
  locationType: z.enum(['city', 'coords', 'zip']).default('city'),
  city: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
  zip: z.string().optional(),
  units: z.enum(['metric', 'imperial']).default('metric'),
  type: z.enum(['current', 'forecast']).default('current'),
}).refine((data) => {
  if (data.locationType === 'city' && !data.city) return false;
  if (data.locationType === 'coords' && (!data.lat || !data.lon)) return false;
  if (data.locationType === 'zip' && !data.zip) return false;
  return true;
}, {
  message: 'Required location parameters missing for the specified locationType',
});

// GET /api/weather
router.get('/', authRequired, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = weatherQuerySchema.parse(req.query) as WeatherQuery;
    const result = await getWeather(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

